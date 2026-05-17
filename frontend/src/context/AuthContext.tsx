"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    isLoading: true,
  });
  const router = useRouter();

  // 초기화: 로컬 스토리지에서 토큰 확인
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    console.log("[AuthContext] Initializing, token found:", !!token);
    setAuthState({
      isLoggedIn: !!token,
      isLoading: false,
    });
  }, []);

  const login = useCallback((token: string) => {
    console.log("[AuthContext] Login called with token");
    localStorage.setItem("accessToken", token);
    setAuthState({
      isLoggedIn: true,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(() => {
    console.log("[AuthContext] Logout called");
    localStorage.removeItem("accessToken");
    setAuthState({
      isLoggedIn: false,
      isLoading: false,
    });
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
