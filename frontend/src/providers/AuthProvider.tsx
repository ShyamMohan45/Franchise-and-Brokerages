"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  _id?: string;
  email: string;
  fullName: string;
  name?: string;
  phone?: string;
  role: "guest" | "business_owner" | "brand_owner" | "investor" | "broker" | "admin" | "super_admin";
  status: string;
}

interface AuthContextType {
  user: User | null;
  businessProfile: any | null;
  investorProfile: any | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { email: string; password: string; fullName: string; phone?: string; role: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [businessProfile, setBusinessProfile] = useState<any | null>(null);
  const [investorProfile, setInvestorProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get<{ user: User; businessProfile: any; investorProfile: any }>("/auth/me");
      if (res.success && res.data) {
        setUser(res.data.user);
        setBusinessProfile(res.data.businessProfile);
        setInvestorProfile(res.data.investorProfile);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ user: User; token: string }>("/auth/login", { email, password });
    if (res.success && res.data) {
      api.saveAuth(res.data.token);
      setUser(res.data.user);
      await fetchCurrentUser();
      // Redirect based on role
      if (res.data.user.role === "admin" || res.data.user.role === "super_admin") {
        router.push("/dashboard/admin");
      } else if (res.data.user.role === "investor") {
        router.push("/dashboard/investor");
      } else if (res.data.user.role === "broker") {
        router.push("/dashboard/brokerage");
      } else {
        router.push("/dashboard/business");
      }
    }
  };

  const register = async (payload: { email: string; password: string; fullName: string; phone?: string; role: string }) => {
    const res = await api.post<{ user: User; token: string }>("/auth/register", payload);
    if (res.success && res.data) {
      api.saveAuth(res.data.token);
      setUser(res.data.user);
      await fetchCurrentUser();
      if (payload.role === "investor") {
        router.push("/dashboard/investor");
      } else {
        router.push("/dashboard/business");
      }
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      api.clearAuth();
      setUser(null);
      setBusinessProfile(null);
      setInvestorProfile(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        businessProfile,
        investorProfile,
        isLoading,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
