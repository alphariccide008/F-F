# API Configuration

This folder contains the API configuration for the FlexyFuel mobile app.

## Quick Setup

### 1. Find Your Computer's IP
Run `find-my-ip.bat` in the root folder or:
- Windows: Open CMD and type `ipconfig`
- Mac/Linux: Open Terminal and type `ifconfig`

### 2. Update the Configuration
Edit `api.config.ts` and change the `LOCAL_IP`:

```typescript
const LOCAL_IP = '192.168.1.100'; // Your computer's IP here
```

### 3. Restart the App
If the app is running, it will hot-reload automatically.

## Configuration Options

### `LOCAL_IP`
Your computer's local network IP address. Both your phone and computer must be on the same WiFi network.

**Examples:**
- `192.168.1.100` (Most common for home WiFi)
- `172.20.10.3` (Common for mobile hotspot)
- `10.0.0.100` (Some routers)

### `PORT`
The port where your backend server is running. Default is `3000`.

### `PRODUCTION_URL`
The URL of your production backend API. Update this when you deploy.

## Device-Specific Setup

### Physical Phone (Recommended for Testing)
- Use your computer's actual IP address
- Make sure both are on the same WiFi
- Example: `const LOCAL_IP = '192.168.1.100';`

### Android Emulator
- Use the special emulator IP
- Example: `const LOCAL_IP = '10.0.2.2';`

### iOS Simulator
- Use localhost
- Example: `const LOCAL_IP = 'localhost';`

## Troubleshooting

### "Connection Timeout" Error
1. Verify backend is running: Check terminal shows "Server: http://localhost:3000"
2. Check IP is correct: Open phone's browser, go to `http://YOUR_IP:3000/health`
3. Check firewall: Allow Node.js through Windows Firewall
4. Check WiFi: Ensure both devices on same network

### "Network Request Failed"
- Phone might be on mobile data instead of WiFi
- IP address in config might be wrong

### Backend Connection Works in Browser but Not in App
- Clear app cache and restart
- Make sure you saved the config file
- Try restarting Metro bundler

## Testing the Connection

### Method 1: Browser Test
On your phone's browser, navigate to:
```
http://YOUR_IP:3000/health
```

You should see:
```json
{
  "success": true,
  "message": "FlexyFuel API is running"
}
```

### Method 2: App Debug
The app logs the API URL when making requests. Check the console:
```
📤 POST /auth/login-with-password
```

If you see timeouts, the IP is likely wrong.

## Quick Reference

| Network Setup | IP to Use |
|--------------|-----------|
| Same WiFi | Your computer's IP (run `ipconfig`) |
| Android Emulator | `10.0.2.2` |
| iOS Simulator | `localhost` |
| Mobile Hotspot | Hotspot's IP (check hotspot settings) |

## Production Deployment

When deploying to production:

1. Deploy your backend to a hosting service (Render, Railway, AWS, etc.)
2. Get the production URL
3. Update `PRODUCTION_URL` in `api.config.ts`
4. Build the app

The app will automatically use the production URL when not in development mode.
