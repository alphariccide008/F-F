/**
 * Debug Utilities
 *
 * Helper functions for debugging the app, especially for API connectivity issues
 */

import API_CONFIG from '../config/api.config';

/**
 * Get current API configuration info
 */
export const getAPIInfo = () => {
  const baseURL = API_CONFIG.getBaseURL();

  return {
    baseURL,
    isDevelopment: __DEV__,
    timeout: API_CONFIG.TIMEOUT,
    environment: __DEV__ ? 'Development' : 'Production',
  };
};

/**
 * Log API configuration to console
 */
export const logAPIConfig = () => {
  const info = getAPIInfo();

  console.log('================================');
  console.log('🔧 API Configuration');
  console.log('================================');
  console.log(`Environment: ${info.environment}`);
  console.log(`Base URL: ${info.baseURL}`);
  console.log(`Timeout: ${info.timeout}ms`);
  console.log('================================');

  if (__DEV__) {
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure backend is running');
    console.log('2. Test in browser: ' + info.baseURL.replace('/api/v1', '/health'));
    console.log('3. Check both devices on same WiFi');
    console.log('4. Update IP in config/api.config.ts if needed\n');
  }

  return info;
};

/**
 * Test backend connectivity
 */
export const testBackendConnection = async (): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  try {
    const baseURL = API_CONFIG.getBaseURL();
    const healthURL = baseURL.replace('/api/v1', '/health');

    console.log(`🔍 Testing connection to: ${healthURL}`);

    const response = await fetch(healthURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ Backend connection successful!');
      return {
        success: true,
        message: 'Connected to backend successfully',
        details: data,
      };
    } else {
      console.log('⚠️ Backend responded but with error');
      return {
        success: false,
        message: 'Backend responded with error',
        details: data,
      };
    }
  } catch (error: any) {
    console.error('❌ Backend connection failed:', error.message);

    let message = 'Cannot connect to backend';

    if (error.message?.includes('timeout')) {
      message = 'Connection timeout - Check IP address in config/api.config.ts';
    } else if (error.message?.includes('Network request failed')) {
      message = 'Network error - Check WiFi connection';
    }

    return {
      success: false,
      message,
      details: error.message,
    };
  }
};

/**
 * Format API error for display
 */
export const formatAPIError = (error: any): string => {
  if (error?.message) {
    return error.message;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.code === 'ECONNABORTED') {
    return 'Connection timeout. Check:\n1. Backend server is running\n2. IP address in config/api.config.ts is correct\n3. Both devices on same WiFi\n4. Windows Firewall allows Node.js';
  }

  if (error?.code === 'NETWORK_ERROR') {
    return 'Network error. Check your internet connection.';
  }

  return 'An unexpected error occurred';
};

export default {
  getAPIInfo,
  logAPIConfig,
  testBackendConnection,
  formatAPIError,
};
