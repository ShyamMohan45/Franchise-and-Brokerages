import { apiClient } from './apiClient';
import { SecureStorageService } from './secureStorage';
import { User, LoginResponseData } from '../types/auth';

export class AuthService {
  /**
   * Log in user, store tokens in SecureStore, and return User profile
   */
  public static async login(email: string, password: string): Promise<User> {
    const response = await apiClient.post<LoginResponseData>('/auth/login', {
      email,
      password,
    });

    if (!response.data?.token || !response.data?.user) {
      throw new Error(response.message || 'Login failed');
    }

    const { user, token, refreshToken } = response.data;

    // Securely persist credentials
    await SecureStorageService.saveTokens({ token, refreshToken });
    await SecureStorageService.saveUser(user);

    return user;
  }

  /**
   * Register a new user and store initial session
   */
  public static async register(payload: {
    fullName: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
  }): Promise<User> {
    const response = await apiClient.post<LoginResponseData>('/auth/register', payload);

    if (!response.data?.token || !response.data?.user) {
      throw new Error(response.message || 'Registration failed');
    }

    const { user, token, refreshToken } = response.data;
    await SecureStorageService.saveTokens({ token, refreshToken });
    await SecureStorageService.saveUser(user);

    return user;
  }

  /**
   * Fetch current authenticated user from backend /auth/me
   */
  public static async fetchMe(): Promise<{ user: User; businessProfile?: any; investorProfile?: any }> {
    const response = await apiClient.get<{ user: User; businessProfile?: any; investorProfile?: any }>('/auth/me');
    if (!response.data?.user) {
      throw new Error('Unable to retrieve user profile');
    }
    await SecureStorageService.saveUser(response.data.user);
    return response.data;
  }

  /**
   * Log out user from device and notify backend
   */
  public static async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout to allow clean local departure
    } finally {
      await SecureStorageService.clearAuthData();
    }
  }

  /**
   * Restore existing session on app launch
   */
  public static async restoreSession(): Promise<{ user: User | null; token: string | null }> {
    const token = await SecureStorageService.getAccessToken();
    if (!token) {
      return { user: null, token: null };
    }

    try {
      const data = await this.fetchMe();
      return { user: data.user, token };
    } catch (error) {
      // If token expired, attempt refresh
      const refreshToken = await SecureStorageService.getRefreshToken();
      if (!refreshToken) {
        await SecureStorageService.clearAuthData();
        return { user: null, token: null };
      }

      try {
        const refreshRes = await apiClient.post<{ token: string }>('/auth/refresh', { refreshToken });
        const newToken = refreshRes.data?.token;
        if (newToken) {
          await SecureStorageService.saveTokens({ token: newToken, refreshToken });
          const data = await this.fetchMe();
          return { user: data.user, token: newToken };
        }
      } catch {
        await SecureStorageService.clearAuthData();
      }
      return { user: null, token: null };
    }
  }

  /**
   * Request password reset link
   */
  public static async forgotPassword(email: string): Promise<string> {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.message || 'Password reset link sent if account exists.';
  }

  /**
   * Complete password reset using token
   */
  public static async resetPassword(token: string, newPassword: string): Promise<string> {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.message || 'Password has been reset successfully.';
  }

  /**
   * Verify email address using token
   */
  public static async verifyEmail(token: string): Promise<string> {
    const response = await apiClient.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
    return response.message || 'Email verified successfully.';
  }

  /**
   * Change password for logged-in user
   */
  public static async changePassword(currentPassword: string, newPassword: string): Promise<string> {
    const response = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.message || 'Password changed successfully.';
  }
}
