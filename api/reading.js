// api/reading.js — Jyotisha Premium AI Reading
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const LANG_INSTR = {
  en: 'Write in warm, flowing English.',
  kn: 'ಕನ್ನಡದಲ್ಲಿ ಮಾತ್ರ ಬರೆಯಿರಿ. Write entirely in Kannada script only.',
  hi: 'केवल हिंदी में लिखें। Write entirely in Hindi only.',
  te: 'తెలుగులో మాత్రమే రాయండి. Write entirely in Telugu script only.',
  ta: 'தமிழில் மட்டும் எழுதுங்கள். Write entirely in Tamil script only.',
};

function buildPrompt(tab, data, lang) {
  const { name, sunSign, moonSign, rising, nakshatra, planets, elBalance, age, lucky } = data;
  const li = LANG_INSTR[lang] || LANG_INSTR.en;

  const base = `
Seeker: ${name}, Age ${age}.
Sun Sign: ${sunSign} | Moon Sign: ${moonSign} | Rising (Lagna): ${rising}
Nakshatra: ${nakshatra}
Mercury in ${planets.Mercury} | Venus in ${planets.Venus} | Mars in ${planets.Mars}
Jupiter in ${planets.Jupiter} | Saturn in ${planets.Saturn}
Rahu in ${planets.Rahu} | Ketu in ${planets.Ketu}
Dominant Element: ${Object.entries(elBalance).sort((a,b)=>b[1]-a[1])[0][0]}
Lucky Gem: ${lucky.gem} | Lucky Color: ${lucky.color} | Lucky Day: ${lucky.day}`.trim();

  const asks = {
    past: `Write a PAST LIFE & KARMA reading for ${name}. ${base}
Cover: karmic debts carried forward (Rahu-Ketu axis), childhood patterns shaped by their chart, Saturn's early lessons, soul mission this lifetime. 4 deep warm paragraphs. Address as ${name}.`,

    present: `Write a PRESENT LIFE reading for ${name} in 2025-2026. ${base}
Cover: current planetary transits affecting them, dominant life theme right now, what Saturn is teaching, Jupiter's blessings, practical guidance for this moment. 4 personal paragraphs.`,

    future: `Write a FUTURE reading for ${name} for next 5 years (2026-2030). ${base}
Cover: major planetary dasha cycles ahead, Saturn return implications, Jupiter transits bringing expansion, Rahu-Ketu shifts, specific windows of opportunity, what they are building toward. 4 hopeful paragraphs.`,

    love: `Write a LOVE & MARRIAGE reading for ${name}. ${base}
Cover: how they love (Venus sign), what they need emotionally (Moon sign), marriage timing indicators, ideal partner qualities, past relationship karma, compatibility with which signs. 4 warm paragraphs.`,

    career: `Write a CAREER & FINANCE reading for ${name}. ${base}
Cover: natural career gifts (10th house, Saturn), wealth patterns (2nd/11th house), best fields for them, financial abundance timing, business vs service, practical steps for success. 4 insightful paragraphs.`,

    health: `Write a HEALTH & WELLNESS reading for ${name}. ${base}
Cover: body constitution (element balance), vulnerable areas indicated by their chart, Ayurvedic dosha, mental wellness, best wellness practices for their planetary makeup, healing crystals and practices. 4 caring paragraphs.`,

    daily: `Write TODAY'S HOROSCOPE for ${name} (${sunSign}). ${base}
Cover: energy of the day, what to focus on, what to avoid, relationship energy today, lucky moment today. Keep it concise — 2 vibrant paragraphs.`,

    weekly: `Write THIS WEEK'S HOROSCOPE for ${name} (${sunSign}). ${base}
Cover: weekly theme, career energy, relationship energy, financial energy, spiritual energy, best day of week. 3 flowing paragraphs.`,

    monthly: `Write THIS MONTH'S HOROSCOPE for ${name} (${sunSign}). ${base}
Cover: monthly theme, major shifts mid-month, love and relationships, career and money, health and wellness, key dates to watch. 4 detailed paragraphs.`,

    yearly: `Write 2025-2026 YEARLY PREDICTION for ${name}. ${base}
Cover: overall theme of the year, major life areas transforming, career and financial outlook, love and relationships, spiritual growth, best months of the year, months to be cautious. 5 rich paragraphs.`,

    dosdonts: `Write DOS & DON'TS for ${name} based on their chart. ${base}
Format as flowing prose advice (no bullet lists). Cover: what actions strengthen their energy, what habits to cultivate, what to avoid, which relationships to nurture, lifestyle aligned with their chart. 3 practical paragraphs.`,

    compatibility: `Write a MARRIAGE COMPATIBILITY reading for ${name}. ${base}
Cover: most compatible signs and why, signs to be cautious with, what ${name} needs in a partner, ideal timing for marriage, Mangal dosha check, Navamsa insights. 4 detailed paragraphs.`,
  };

  const system = `You are Jyotisha — a gifted master astrologer blending Vedic and Western traditions with 30 years of wisdom. Your readings are warm, mystical, deeply personal, and grounded. Write only plain paragraphs — absolutely no markdown, no bullet points, no headers, no asterisks, no numbered lists. Pure flowing prose only. ${li}`;

  return { system, prompt: asks[tab] || asks.present };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Server not configured. Add GEMINI_API_KEY in Vercel environment variables.' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const { tab, lang, chartData } = body;
  if (!tab || !chartData) return res.status(400).json({ error: 'Missing tab or chartData' });

  try {
    const { system, prompt } = buildPrompt(tab, chartData, lang || 'en');

    const gRes = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1200, temperature: 1 },
      }),
    });

    const gData = await gRes.json();

    if (!gRes.ok) {
      const msg = gData?.error?.message || `Gemini error ${gRes.status}`;
      if (gRes.status === 400 || gRes.status === 401 || gRes.status === 403)
        return res.status(401).json({ error: 'Invalid API key. Check Vercel environment variables.' });
      if (gRes.status === 429) return res.status(429).json({ error: 'Rate limit reached. Please wait a moment and try again.' });
      return res.status(gRes.status).json({ error: msg });
    }

    const text = (gData.candidates?.[0]?.content?.parts || [])
      .map(p => p.text || '')
      .join('')
      .trim();

    if (!text) return res.status(500).json({ error: 'Empty response from AI' });

    return res.status(200).json({ text });

  } catch (err) {
    console.error('Gemini error:', err);
    return res.status(500).json({ error: err.message || 'AI reading failed' });
  }
}
