import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types/auth';
import { AuthService } from '../services/authService';
import { SecureStorageService } from '../services/secureStorage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  businessProfile: any | null;
  investorProfile: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  register: (payload: { fullName: string; email: string; password: string; role: string; phone?: string }) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [businessProfile, setBusinessProfile] = useState<any | null>(null);
  const [investorProfile, setInvestorProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const session = await AuthService.restoreSession();
        if (isMounted) {
          setUser(session.user);
          setToken(session.token);
        }
      } catch (err) {
        console.warn('[useAuth] Session restore warning:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    setIsLoading(true);
    try {
      const loggedUser = await AuthService.login(email, pass);
      const savedToken = await SecureStorageService.getAccessToken();
      setUser(loggedUser);
      setToken(savedToken);
      // Fetch profile models
      try {
        const data = await AuthService.fetchMe();
        setBusinessProfile(data.businessProfile || null);
        setInvestorProfile(data.investorProfile || null);
      } catch {}
      return loggedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: {
    fullName: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
  }): Promise<User> => {
    setIsLoading(true);
    try {
      const newUser = await AuthService.register(payload);
      const savedToken = await SecureStorageService.getAccessToken();
      setUser(newUser);
      setToken(savedToken);
      return newUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
      setToken(null);
      setBusinessProfile(null);
      setInvestorProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async (): Promise<void> => {
    try {
      const data = await AuthService.fetchMe();
      setUser(data.user);
      setBusinessProfile(data.businessProfile || null);
      setInvestorProfile(data.investorProfile || null);
    } catch (err) {
      console.warn('[useAuth] Refresh profile warning:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        businessProfile,
        investorProfile,
        isAuthenticated: Boolean(user && token),
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
