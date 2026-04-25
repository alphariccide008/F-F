/**
 * API Configuration
 *
 * QUICK SETUP:
 * 1. Find your computer's IP address:
 *    - Windows: Open Command Prompt, type 'ipconfig'
 *    - Mac: Open Terminal, type 'ifconfig'
 *    - Look for your WiFi adapter's IPv4 address
 *
 * 2. Update LOCAL_IP below with your computer's IP
 *
 * 3. Make sure your phone and computer are on the SAME WiFi network
 */

// ============================================
// UPDATE THIS WITH YOUR COMPUTER'S IP ADDRESS
// ============================================
const LOCAL_IP = '192.168.1.59'; // Change this to your computer's IP
const PORT = '3002';

// ============================================
// API Configuration (Don't change below)
// ============================================
export const API_CONFIG = {
  // Local development URL
  LOCAL_URL: `http://${LOCAL_IP}:${PORT}/api/v1`,

  // Production URL - Render deployment
  PRODUCTION_URL: 'https://ff-backend-1.onrender.com/api/v1',

  // Timeout in milliseconds (60s to handle Render cold starts)
  TIMEOUT: 60000,

  // Get the current base URL based on environment
  getBaseURL: () => {
    return API_CONFIG.PRODUCTION_URL;
  },
};

// Common IP configurations for reference:
// - Android Emulator: Use '10.0.2.2' instead of 'localhost'
// - iOS Simulator: Use 'localhost'
// - Physical Device: Use your computer's local IP (e.g., '192.168.1.100')
// - Same WiFi required for physical devices

export default API_CONFIG;
