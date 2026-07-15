/**
 * Jyotisha Astrology Engine v2
 * Vedic + Western blend — accurate calculations
 */

const AstroEngine = (() => {

  // ── Signs ──────────────────────────────────────────────────
  const SIGNS = [
    { id:0,  name:'Aries',       kn:'ಮೇಷ',      hi:'मेष',      te:'మేషం',     ta:'மேஷம்',    glyph:'♈', el:'Fire',  quality:'Cardinal', ruler:'Mars',    lucky:{color:'Red',gem:'Red Coral',rudraksha:'3 Mukhi',day:'Tuesday',num:9} },
    { id:1,  name:'Taurus',      kn:'ವೃಷಭ',     hi:'वृषभ',     te:'వృషభం',    ta:'ரிஷபம்',   glyph:'♉', el:'Earth', quality:'Fixed',    ruler:'Venus',   lucky:{color:'Green',gem:'Diamond',rudraksha:'6 Mukhi',day:'Friday',num:6} },
    { id:2,  name:'Gemini',      kn:'ಮಿಥುನ',   hi:'मिथुन',    te:'మిథునం',   ta:'மிதுனம்',  glyph:'♊', el:'Air',   quality:'Mutable',  ruler:'Mercury', lucky:{color:'Yellow',gem:'Emerald',rudraksha:'4 Mukhi',day:'Wednesday',num:5} },
    { id:3,  name:'Cancer',      kn:'ಕರ್ಕ',     hi:'कर्क',     te:'కర్కాటకం', ta:'கடகம்',    glyph:'♋', el:'Water', quality:'Cardinal', ruler:'Moon',    lucky:{color:'Silver',gem:'Pearl',rudraksha:'2 Mukhi',day:'Monday',num:2} },
    { id:4,  name:'Leo',         kn:'ಸಿಂಹ',    hi:'सिंह',     te:'సింహం',    ta:'சிம்மம்',  glyph:'♌', el:'Fire',  quality:'Fixed',    ruler:'Sun',     lucky:{color:'Gold',gem:'Ruby',rudraksha:'1 Mukhi',day:'Sunday',num:1} },
    { id:5,  name:'Virgo',       kn:'ಕನ್ಯಾ',   hi:'कन्या',    te:'కన్యా',    ta:'கன்னி',    glyph:'♍', el:'Earth', quality:'Mutable',  ruler:'Mercury', lucky:{color:'Navy Blue',gem:'Emerald',rudraksha:'4 Mukhi',day:'Wednesday',num:5} },
    { id:6,  name:'Libra',       kn:'ತುಲಾ',    hi:'तुला',     te:'తుల',      ta:'துலாம்',   glyph:'♎', el:'Air',   quality:'Cardinal', ruler:'Venus',   lucky:{color:'Pink',gem:'Diamond',rudraksha:'6 Mukhi',day:'Friday',num:6} },
    { id:7,  name:'Scorpio',     kn:'ವೃಶ್ಚಿಕ', hi:'वृश्चिक',  te:'వృశ్చికం', ta:'விருச்சிகம்',glyph:'♏', el:'Water', quality:'Fixed',    ruler:'Mars',    lucky:{color:'Dark Red',gem:'Red Coral',rudraksha:'3 Mukhi',day:'Tuesday',num:9} },
    { id:8,  name:'Sagittarius', kn:'ಧನು',     hi:'धनु',      te:'ధనుస్సు',  ta:'தனுசு',    glyph:'♐', el:'Fire',  quality:'Mutable',  ruler:'Jupiter', lucky:{color:'Purple',gem:'Yellow Sapphire',rudraksha:'5 Mukhi',day:'Thursday',num:3} },
    { id:9,  name:'Capricorn',   kn:'ಮಕರ',     hi:'मकर',      te:'మకరం',     ta:'மகரம்',    glyph:'♑', el:'Earth', quality:'Cardinal', ruler:'Saturn',  lucky:{color:'Black',gem:'Blue Sapphire',rudraksha:'7 Mukhi',day:'Saturday',num:8} },
    { id:10, name:'Aquarius',    kn:'ಕುಂಭ',    hi:'कुंभ',     te:'కుంభం',    ta:'கும்பம்',  glyph:'♒', el:'Air',   quality:'Fixed',    ruler:'Saturn',  lucky:{color:'Electric Blue',gem:'Blue Sapphire',rudraksha:'7 Mukhi',day:'Saturday',num:8} },
    { id:11, name:'Pisces',      kn:'ಮೀನ',     hi:'मीन',      te:'మీనం',     ta:'மீனம்',    glyph:'♓', el:'Water', quality:'Mutable',  ruler:'Jupiter', lucky:{color:'Sea Green',gem:'Yellow Sapphire',rudraksha:'5 Mukhi',day:'Thursday',num:3} },
  ];

  // ── Nakshatras (27 lunar mansions) ─────────────────────────
  const NAKSHATRAS = [
    'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
    'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
    'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
    'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha',
    'Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'
  ];

  // ── Julian Day ──────────────────────────────────────────────
  function toJD(y, m, d) {
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
  }

  // ── Sun longitude (ecliptic, accurate to ~1°) ───────────────
  function sunLongitude(jd) {
    const n = jd - 2451545.0;
    const L = (280.460 + 0.9856474 * n) % 360;
    const g = ((357.528 + 0.9856003 * n) % 360) * Math.PI / 180;
    const lambda = L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g);
    return ((lambda % 360) + 360) % 360;
  }

  // ── Moon longitude (accurate to ~2°) ───────────────────────
  function moonLongitude(jd) {
    const n = jd - 2451545.0;
    const L = (218.316 + 13.176396 * n) % 360;
    const M = ((134.963 + 13.064993 * n) % 360) * Math.PI / 180;
    const F = ((93.272  + 13.229350 * n) % 360) * Math.PI / 180;
    const lambda = L + 6.289 * Math.sin(M) - 1.274 * Math.sin(2*F - M) + 0.658 * Math.sin(2*F);
    return ((lambda % 360) + 360) % 360;
  }

  // ── Ascendant (rising sign, needs lat/lon + time) ──────────
  function ascendant(jd, lat, lon) {
    const n   = jd - 2451545.0;
    const lst = ((100.4606184 + 360.98564774 * n + lon) % 360 + 360) % 360;
    const eps = (23.439 - 0.0000004 * n) * Math.PI / 180;
    const lstR = lst * Math.PI / 180;
    const latR = lat * Math.PI / 180;
    const y = -Math.cos(lstR);
    const x = Math.sin(lstR) * Math.cos(eps) + Math.tan(latR) * Math.sin(eps);
    let asc = Math.atan2(y, x) * 180 / Math.PI;
    if (asc < 0) asc += 360;
    return asc;
  }

  // ── Planet approximate longitudes ──────────────────────────
  function planetLongitudes(jd) {
    const n = jd - 2451545.0;
    const planets = {
      Mercury: { L0: 252.251, L1: 4.092317, e: 0.205, om: 77.46 },
      Venus:   { L0: 181.980, L1: 1.602136, e: 0.007, om: 131.6 },
      Mars:    { L0: 355.433, L1: 0.524071, e: 0.093, om: 336.1 },
      Jupiter: { L0:  34.351, L1: 0.083056, e: 0.049, om:  14.3 },
      Saturn:  { L0:  50.077, L1: 0.033459, e: 0.056, om:  93.1 },
      Rahu:    { L0: 125.045, L1:-0.052954, e: 0,     om:  0    },
    };
    const result = {};
    for (const [name, p] of Object.entries(planets)) {
      let lon = ((p.L0 + p.L1 * n) % 360 + 360) % 360;
      result[name] = lon;
    }
    result.Ketu = ((result.Rahu + 180) % 360);
    return result;
  }

  // ── Vedic correction (Ayanamsa — Lahiri) ───────────────────
  function ayanamsa(jd) {
    const t = (jd - 2415020.0) / 36524.25;
    return 23.85 + 0.017 * t; // simplified Lahiri
  }

  // ── Degrees → sign index ────────────────────────────────────
  function degToSign(deg) { return Math.floor(((deg % 360) + 360) % 360 / 30); }

  // ── Nakshatra from moon longitude ──────────────────────────
  function getNakshatra(moonLon) {
    const idx = Math.floor(moonLon / (360 / 27));
    return NAKSHATRAS[idx % 27];
  }

  // ── Traits per sign ────────────────────────────────────────
  const TRAITS = {
    Aries:['Bold','Passionate','Leader','Impulsive'],
    Taurus:['Reliable','Sensual','Patient','Stubborn'],
    Gemini:['Curious','Witty','Adaptable','Restless'],
    Cancer:['Nurturing','Intuitive','Protective','Moody'],
    Leo:['Generous','Confident','Loyal','Dramatic'],
    Virgo:['Analytical','Meticulous','Helpful','Modest'],
    Libra:['Diplomatic','Charming','Fair','Indecisive'],
    Scorpio:['Intense','Magnetic','Determined','Secretive'],
    Sagittarius:['Adventurous','Optimistic','Free','Blunt'],
    Capricorn:['Ambitious','Disciplined','Practical','Reserved'],
    Aquarius:['Independent','Visionary','Humanitarian','Eccentric'],
    Pisces:['Empathetic','Dreamy','Compassionate','Intuitive'],
  };

  // ── Main compute ────────────────────────────────────────────
  function compute({ year, month, day, hour, minute, lat = 12.97, lon = 77.59 }) {
    const jd  = toJD(year, month, day) + (hour + minute / 60) / 24;
    const aya = ayanamsa(jd);

    const sunLon  = sunLongitude(jd);
    const moonLon = moonLongitude(jd);
    const ascLon  = ascendant(jd, lat, lon);
    const pLons   = planetLongitudes(jd);

    // Vedic (sidereal) — subtract ayanamsa
    const sunV  = ((sunLon  - aya + 360) % 360);
    const moonV = ((moonLon - aya + 360) % 360);
    const ascV  = ((ascLon  - aya + 360) % 360);

    const sunSign  = SIGNS[degToSign(sunV)];
    const moonSign = SIGNS[degToSign(moonV)];
    const rising   = SIGNS[degToSign(ascV)];
    const nakshatra = getNakshatra(moonV);

    const planets = {};
    const planetNames = ['Mercury','Venus','Mars','Jupiter','Saturn','Rahu','Ketu'];
    for (const p of planetNames) {
      const vLon = ((pLons[p] - aya + 360) % 360);
      planets[p] = { sign: SIGNS[degToSign(vLon)], lon: vLon.toFixed(1) };
    }

    // Element balance
    const elBalance = { Fire:0, Earth:0, Water:0, Air:0 };
    [sunSign, moonSign, rising].forEach(s => elBalance[s.el]++);

    // Lucky info from sun sign
    const lucky = {
      ...sunSign.lucky,
      nakshatra,
      luckyNum: sunSign.lucky.num,
    };

    return { sunSign, moonSign, rising, nakshatra, planets, elBalance, lucky, jd };
  }

  // ── Public ──────────────────────────────────────────────────
  return { compute, SIGNS, NAKSHATRAS, TRAITS };
})();

window.AstroEngine = AstroEngine;
