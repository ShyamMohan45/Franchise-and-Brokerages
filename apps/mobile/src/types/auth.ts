export type UserRole =
  | 'guest'
  | 'business_owner'
  | 'brand_owner'
  | 'investor'
  | 'broker'
  | 'admin'
  | 'super_admin';

export type UserStatus = 'active' | 'pending_verification' | 'suspended';

export interface User {
  id: string;
  _id?: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  avatarUrl?: string;
  createdAt?: string;
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
}

export interface LoginResponseData {
  user: User;
  token: string;
  refreshToken: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  error: string | null;
}
