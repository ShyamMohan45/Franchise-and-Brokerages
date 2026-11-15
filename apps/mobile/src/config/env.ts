import Constants from 'expo-constants';
import { Platform } from 'react-native';

export type NetworkEnvironment = 'auto' | 'emulator' | 'lan' | 'production';

// Default port for FranchiseBridge Express API
const BACKEND_PORT = 5000;
const API_PREFIX = '/api/v1';

// Workstation IP for physical Android device testing over Wi-Fi (if not using Expo Go auto-detect)
export const MANUAL_LAN_IP = '172.22.82.210';

// Production Cloud Backend API URL
export const PRODUCTION_API_URL = 'https://api.franchisebridge.com/api/v1';

/**
 * Resolves the appropriate backend API address based on platform and environment.
 * - Android Emulator: 10.0.2.2 (special Android alias for host machine localhost)
 * - Physical Device: Detected local network IP via Expo hostUri or MANUAL_LAN_IP
 * - iOS Simulator: localhost:5000
 * - Production: secure HTTPS cloud domain
 */
export function resolveApiBaseUrl(mode: NetworkEnvironment = 'auto'): string {
  // 1. Highest precedence: Explicit environment variable (EAS Build / Production / Staging)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Extra configuration embedded in app.json (standalone preview APK fallback)
  const extraApiUrl = (Constants.expoConfig?.extra as Record<string, any> | undefined)?.apiUrl;
  if (extraApiUrl) {
    return extraApiUrl;
  }

  if (mode === 'production') {
    return PRODUCTION_API_URL;
  }

  if (mode === 'emulator') {
    return Platform.OS === 'android'
      ? `http://10.0.2.2:${BACKEND_PORT}${API_PREFIX}`
      : `http://localhost:${BACKEND_PORT}${API_PREFIX}`;
  }

  if (mode === 'lan') {
    return `http://${MANUAL_LAN_IP}:${BACKEND_PORT}${API_PREFIX}`;
  }

  // Auto-detect mode via Metro hostUri in Expo Go / Dev Client
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    // Expo Go auto-extracts your computer's actual Wi-Fi IP address
    const hostIp = hostUri.split(':')[0];
    return `http://${hostIp}:${BACKEND_PORT}${API_PREFIX}`;
  }

  // Default platform fallback for physical Android devices and local development
  if (Platform.OS === 'android') {
    return MANUAL_LAN_IP
      ? `http://${MANUAL_LAN_IP}:${BACKEND_PORT}${API_PREFIX}`
      : `http://10.0.2.2:${BACKEND_PORT}${API_PREFIX}`;
  }

  return `http://localhost:${BACKEND_PORT}${API_PREFIX}`;
}

export const ENV = {
  APP_NAME: 'FranchiseBridge',
  APP_VERSION: '1.0.0',
  DEFAULT_ENV: 'auto' as NetworkEnvironment,
  TIMEOUT_MS: 15000,
  API_BASE_URL: resolveApiBaseUrl('auto'),
};
