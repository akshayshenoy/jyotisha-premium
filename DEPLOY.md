# 🌟 Jyotisha Premium — Deploy Guide
### By Akshay Shenoy

## Project Structure
```
jyotisha-premium/
├── api/
│   └── reading.js          ← AI reading backend (secure)
├── public/
│   ├── index.html          ← Full premium frontend
│   └── js/
│       └── astro-engine.js ← Accurate astrology calculations
├── vercel.json
├── package.json
└── DEPLOY.md
```

## Deploy in 5 Minutes

### 1. Get Anthropic API Key
→ https://console.anthropic.com → API Keys → Create Key

### 2. GitHub
1. github.com → New repository → Name: `jyotisha-premium` → Public
2. Upload all files (drag & drop, keeping folder structure)
3. Commit changes

### 3. Vercel
1. vercel.com → Sign up with GitHub
2. Add New Project → Import `jyotisha-premium`
3. Leave all settings default → Deploy

### 4. Add API Key ⚠️ CRITICAL
Vercel Dashboard → Project → Settings → Environment Variables:
- Name:  `ANTHROPIC_API_KEY`
- Value: `sk-ant-api03-xxxxx`
→ Save → Deployments → Redeploy

### 5. Live! 🎉
URL: https://jyotisha-premium.vercel.app

## Features
- ✦ Animated star field + meteor showers
- 🪐 Interactive spinning zodiac wheel
- 🌙 Accurate Vedic calculations (sun, moon, ascendant, nakshatra, all 7 planets)
- 📖 12 reading types (past life, present, future, love, career, health, daily/weekly/monthly/yearly, dos&don'ts, compatibility)
- 🌍 5 languages: English, ಕನ್ನಡ, हिंदी, తెలుగు, தமிழ்
- 💎 Lucky gem, color, number, day, rudraksha
- ⭐ Nakshatra calculation
- 🌆 Birth place → accurate ascendant (50+ Indian cities)
- 📱 Fully mobile responsive
- 🔒 API key hidden server-side

## Cost
- Hosting: FREE (Vercel)
- AI: ~₹0.25 per reading (very cheap)
