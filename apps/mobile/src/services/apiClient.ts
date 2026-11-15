import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ENV, resolveApiBaseUrl, NetworkEnvironment } from '../config/env';
import { SecureStorageService } from './secureStorage';
import { ApiResponse, ApiError } from '../types/api';

class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }> = [];

  constructor() {
    this.instance = axios.create({
      baseURL: ENV.API_BASE_URL,
      timeout: ENV.TIMEOUT_MS,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    console.log(`[ApiClient] Initialized with Base URL: ${ENV.API_BASE_URL}`);
    this.setupInterceptors();
  }

  /**
   * Switch API backend URL at runtime (e.g. between Emulator, LAN, Production)
   */
  public setEnvironment(mode: NetworkEnvironment): string {
    const newBaseUrl = resolveApiBaseUrl(mode);
    this.instance.defaults.baseURL = newBaseUrl;
    console.log(`[ApiClient] Base URL updated to: ${newBaseUrl}`);
    return newBaseUrl;
  }

  public getBaseUrl(): string {
    return this.instance.defaults.baseURL || ENV.API_BASE_URL;
  }

  private processQueue(error: any, token: string | null = null): void {
    this.failedQueue.forEach((promise) => {
      if (token) {
        promise.resolve(token);
      } else {
        promise.reject(error);
      }
    });
    this.failedQueue = [];
  }

  private setupInterceptors(): void {
    // 1. Request Interceptor: Attach Bearer JWT
    this.instance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await SecureStorageService.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 2. Response Interceptor: Handle Token Refresh on 401
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response.data,
      async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (!error.response) {
          // Network failure or backend unreachable
          const targetUrl = `${error.config?.baseURL || ''}${error.config?.url || ''}`;
          console.warn(`[ApiClient] Network request failed to [${targetUrl}]:`, {
            message: error.message,
            code: error.code,
            baseURL: error.config?.baseURL,
            url: error.config?.url,
          });
          const networkError: ApiError = {
            message: 'Unable to connect to FranchiseBridge server. Please check your network.',
            statusCode: 0,
          };
          return Promise.reject(networkError);
        }

        const isAuthRoute =
          originalRequest.url?.includes('/auth/login') ||
          originalRequest.url?.includes('/auth/register') ||
          originalRequest.url?.includes('/auth/refresh');

        if (error.response.status === 401 && !originalRequest._retry && !isAuthRoute) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((newToken) => {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return this.instance(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await SecureStorageService.getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            // Call existing backend refresh endpoint: POST /api/v1/auth/refresh
            const refreshResponse = await axios.post<{ success: boolean; data: { token: string } }>(
              `${this.getBaseUrl()}/auth/refresh`,
              { refreshToken }
            );

            const newToken = refreshResponse.data?.data?.token;
            if (!newToken) {
              throw new Error('Refresh response missing token');
            }

            // Update stored token
            const oldUser = await SecureStorageService.getUser();
            if (oldUser) {
              await SecureStorageService.saveTokens({ token: newToken, refreshToken });
            }

            this.processQueue(null, newToken);

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.instance(originalRequest);
          } catch (refreshErr) {
            this.processQueue(refreshErr, null);
            await SecureStorageService.clearAuthData();

            const parsedError: ApiError = {
              message: 'Session expired. Please log in again.',
              statusCode: 401,
            };
            return Promise.reject(parsedError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Standardize backend error message
        const backendMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        const parsedError: ApiError = {
          message: backendMessage,
          statusCode: error.response?.status,
          errors: error.response?.data?.errors,
        };

        return Promise.reject(parsedError);
      }
    );
  }

  // Generic HTTP helpers
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return (this.instance.get(url, config) as unknown) as Promise<ApiResponse<T>>;
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return (this.instance.post(url, data, config) as unknown) as Promise<ApiResponse<T>>;
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return (this.instance.put(url, data, config) as unknown) as Promise<ApiResponse<T>>;
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return (this.instance.patch(url, data, config) as unknown) as Promise<ApiResponse<T>>;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return (this.instance.delete(url, config) as unknown) as Promise<ApiResponse<T>>;
  }
}

export const apiClient = new ApiClient();
