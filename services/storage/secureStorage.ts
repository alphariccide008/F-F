import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';
const PROFILE_PHOTO_KEY = 'profile_photo_uri';

/**
 * Save access token
 */
export const saveToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

/**
 * Get access token
 */
export const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Save refresh token
 */
export const saveRefreshToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving refresh token:', error);
  }
};

/**
 * Get refresh token
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

/**
 * Save user data
 */
export const saveUser = async (user: any): Promise<void> => {
  try {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

/**
 * Get user data
 */
export const getUser = async (): Promise<any | null> => {
  try {
    const userStr = await SecureStore.getItemAsync(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

/**
 * Save profile photo URI
 */
export const saveProfilePhoto = async (uri: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(PROFILE_PHOTO_KEY, uri);
  } catch (error) {
    console.error('Error saving profile photo:', error);
  }
};

/**
 * Get profile photo URI
 */
export const getProfilePhoto = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(PROFILE_PHOTO_KEY);
  } catch (error) {
    console.error('Error getting profile photo:', error);
    return null;
  }
};

/**
 * Clear all stored data
 */
export const clearStorage = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    await SecureStore.deleteItemAsync(PROFILE_PHOTO_KEY);
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};
