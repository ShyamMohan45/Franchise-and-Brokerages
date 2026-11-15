import * as SecureStore from 'expo-secure-store';
import { User, AuthTokens } from '../types/auth';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'fb_access_token',
  REFRESH_TOKEN: 'fb_refresh_token',
  USER_DATA: 'fb_user_profile',
  ACTIVE_ENV: 'fb_active_env',
} as const;

export class SecureStorageService {
  /**
   * Save access and refresh tokens securely to device hardware keystore
   */
  public static async saveTokens(tokens: AuthTokens): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.token);
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    } catch (error) {
      console.warn('[SecureStorage] Error saving tokens:', error);
    }
  }

  /**
   * Get the current JWT access token
   */
  public static async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.warn('[SecureStorage] Error retrieving access token:', error);
      return null;
    }
  }

  /**
   * Get the current JWT refresh token
   */
  public static async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.warn('[SecureStorage] Error retrieving refresh token:', error);
      return null;
    }
  }

  /**
   * Save user profile JSON securely
   */
  public static async saveUser(user: User): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } catch (error) {
      console.warn('[SecureStorage] Error saving user data:', error);
    }
  }

  /**
   * Retrieve cached user profile
   */
  public static async getUser(): Promise<User | null> {
    try {
      const data = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
      return data ? (JSON.parse(data) as User) : null;
    } catch (error) {
      console.warn('[SecureStorage] Error retrieving user data:', error);
      return null;
    }
  }

  /**
   * Clear all authentication data on logout
   */
  public static async clearAuthData(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.warn('[SecureStorage] Error clearing auth data:', error);
    }
  }
}
