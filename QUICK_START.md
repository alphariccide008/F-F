# Quick Start Guide - Connect Mobile App to Backend

## 🚀 3-Step Setup

### Step 1: Start the Backend Server

```bash
cd ../flexyfuel-backend
npm run dev
```

You should see:
```
🚀 FlexyFuel Backend Server
🌐 Server: http://localhost:3000
```

### Step 2: Find Your Computer's IP Address

**Windows:**
1. Open Command Prompt (Win + R, type `cmd`)
2. Type: `ipconfig`
3. Look for "Wireless LAN adapter Wi-Fi"
4. Find the **IPv4 Address** (e.g., `192.168.1.100`)

**Mac/Linux:**
1. Open Terminal
2. Type: `ifconfig` or `ip addr`
3. Find your WiFi adapter's IP address

**OR** just run this script:
```bash
# Double-click this file in the FlexyFuel folder
find-my-ip.bat
```

### Step 3: Update App Configuration

1. Open `config/api.config.ts`
2. Change the `LOCAL_IP` to your computer's IP:

```typescript
const LOCAL_IP = '192.168.1.100'; // Your IP here
```

3. Save the file

### Step 4: Start the Mobile App

```bash
npm start
```

Press `a` for Android or `i` for iOS.

## ✅ Verify Connection

### Quick Test 1: Browser Test
Open your phone's browser and navigate to:
```
http://YOUR_IP:3000/health
```

You should see a JSON response. If not, check:
- ✅ Backend server is running
- ✅ Phone and computer are on the SAME WiFi
- ✅ Windows Firewall allows Node.js (see below)

### Quick Test 2: Login Test
Try logging in to the app. If you see a timeout error, the IP is wrong or firewall is blocking.

## 🔥 Windows Firewall Setup

If you get "Connection timeout" errors:

1. Windows will usually show a firewall popup when you start the backend
2. Click "Allow access" for both Private and Public networks

**If no popup appeared:**
1. Press `Win + R`
2. Type `firewall.cpl` and press Enter
3. Click "Allow an app or feature through Windows Defender Firewall"
4. Find "Node.js" and check both Private and Public boxes

## 📱 Device-Specific IPs

| Device Type | IP to Use |
|-------------|-----------|
| Physical Phone (Same WiFi) | Your computer's IP (e.g., `192.168.1.100`) |
| Android Emulator | `10.0.2.2` |
| iOS Simulator | `localhost` or `127.0.0.1` |

## 🔄 Changing the IP (Anytime)

Just edit `config/api.config.ts` and change the `LOCAL_IP` variable. The app will hot-reload automatically if it's running.

## ❓ Troubleshooting

### Error: "Connection timeout"
- Backend server not running → Run `npm run dev` in backend folder
- Wrong IP in config → Update `config/api.config.ts`
- Firewall blocking → Allow Node.js in Windows Firewall
- Different WiFi networks → Connect both to same WiFi

### Error: "Network request failed"
- Phone on mobile data → Switch to WiFi
- IP address changed → Update config with new IP

### Error: "Unable to connect"
- Backend crashed → Check backend terminal for errors
- Port 3000 blocked → Check if another app is using port 3000

## 🌐 Production Deployment

When you deploy the backend to production:

1. Update `PRODUCTION_URL` in `config/api.config.ts`:
```typescript
PRODUCTION_URL: 'https://your-actual-api.com/api/v1'
```

2. Build the app for production
3. The app will automatically use the production URL

## 📝 Notes

- You only need to update the IP when it changes (usually after computer restart or changing WiFi networks)
- The config file makes it easy to switch between different IPs quickly
- Both devices MUST be on the same WiFi network for local development
