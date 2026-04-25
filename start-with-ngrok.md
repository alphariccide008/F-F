# Testing FlexyFuel with ngrok (Remote Device on Different WiFi)

## Problem
Your frontend is on Expo tunnel, but backend is on localhost - remote devices can't reach it.

## Solution: Use ngrok to expose backend

### Step 1: Install ngrok
Download from: https://ngrok.com/download
Or with Chocolatey: `choco install ngrok`

### Step 2: Start Backend (if not running)
```bash
cd ../flexyfuel-backend
npm run dev
```

### Step 3: Expose Backend with ngrok
```bash
ngrok http 3002
```

You'll get a URL like: `https://abc123.ngrok-free.app`

### Step 4: Update Frontend Config
In `config/api.config.ts`, temporarily change:

```typescript
const NGROK_URL = 'https://abc123.ngrok-free.app'; // From ngrok output

export const API_CONFIG = {
  LOCAL_URL: `${NGROK_URL}/api/v1`,  // Use ngrok URL
  PRODUCTION_URL: 'https://your-production-api.com/api/v1',
  // ... rest of config
};
```

### Step 5: Update Backend CORS
In `flexyfuel-backend/.env`, add your ngrok domain to ALLOWED_ORIGINS:
```
ALLOWED_ORIGINS="http://localhost:8081,...,https://abc123.ngrok-free.app"
```

Or since you're in development, it already allows all origins (true).

### Step 6: Restart Both
1. Restart backend (Ctrl+C and `npm run dev`)
2. Restart Expo frontend

Now your remote device can reach the backend through ngrok!

## Important Notes:
- ngrok free tier URLs change each time you restart
- For permanent solution, deploy backend to Render/Railway/Heroku
- Don't commit ngrok URL to git (temporary only)
