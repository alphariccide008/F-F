# Network Setup Guide - Fix Mobile App Connection

## Problem
Your mobile app is timing out when connecting to the backend because:
1. Your computer's IP address might have changed
2. Windows Firewall might be blocking the connection

## Solution Steps

### Step 1: Find Your Computer's IP Address

1. Press `Win + R` to open Run dialog
2. Type `cmd` and press Enter
3. In the Command Prompt, type: `ipconfig`
4. Look for **"Wireless LAN adapter Wi-Fi"**
5. Find the **IPv4 Address** (e.g., `192.168.1.100` or `172.20.10.3`)

### Step 2: Allow Node.js Through Windows Firewall

**Option A: Allow when prompted**
- When you start the backend, Windows may show a firewall prompt
- Click "Allow access" for both Private and Public networks

**Option B: Manual firewall configuration**
1. Open Windows Defender Firewall
   - Press `Win + R`
   - Type `firewall.cpl` and press Enter
2. Click "Allow an app or feature through Windows Defender Firewall"
3. Click "Change settings" (requires admin)
4. Look for "Node.js" in the list
5. Check both "Private" and "Public" boxes
6. Click OK

**Option C: Create a firewall rule**
Open PowerShell as Administrator and run:
```powershell
New-NetFirewallRule -DisplayName "Node.js Server" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000
```

### Step 3: Update Mobile App Configuration

Once you have your IP address, we'll update the app configuration.

**Current IP in app:** `172.20.10.3`
**Your actual IP:** (from Step 1)

### Step 4: Test Connection

Make sure:
- ✅ Backend server is running
- ✅ Phone is connected to the same WiFi network as your computer
- ✅ Windows Firewall allows Node.js
- ✅ App configuration has the correct IP address

## Quick Test

To test if the backend is accessible from your network, open a browser on your phone and navigate to:
```
http://YOUR_IP_ADDRESS:3000/health
```

Replace `YOUR_IP_ADDRESS` with the IP from Step 1.

If you see a JSON response, the backend is accessible!

## Common Issues

### "Connection timeout"
- Check Windows Firewall settings
- Verify both devices are on the same WiFi
- Make sure the backend server is running

### "Connection refused"
- Backend server might not be running
- Port 3000 might be blocked

### "Network request failed"
- IP address in app might be wrong
- Phone might be on mobile data instead of WiFi
