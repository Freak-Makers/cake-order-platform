"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isLoggedIn: boolean;
  role: string | null;
  isLoading: boolean;
  login: (token: string, role: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "accessToken";
const ROLE_KEY = "userRole";
const FRESH_SESSION_KEY = "authSessionStarted";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<{
    isLoggedIn: boolean;
    role: string | null;
    isLoading: boolean;
  }>({
    isLoggedIn: false,
    role: null,
    isLoading: true,
  });
  const router = useRouter();

  // 초기화: 새 브라우저 세션의 첫 진입이면 토큰/role 을 비우고 시작 (서버/탭 재시작 후 로그아웃 상태)
  useEffect(() => {
    if (!sessionStorage.getItem(FRESH_SESSION_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ROLE_KEY);
      sessionStorage.setItem(FRESH_SESSION_KEY, "1");
    }
    const token = localStorage.getItem(TOKEN_KEY);
    const role = localStorage.getItem(ROLE_KEY);
    console.log("[AuthContext] Initializing, token found:", !!token, "role:", role);
    setAuthState({
      isLoggedIn: !!token,
      role,
      isLoading: false,
    });
  }, []);

  const login = useCallback((token: string, role: string | null) => {
    console.log("[AuthContext] Login called, role:", role);
    localStorage.setItem(TOKEN_KEY, token);
    if (role) {
      localStorage.setItem(ROLE_KEY, role);
    } else {
      localStorage.removeItem(ROLE_KEY);
    }
    setAuthState({
      isLoggedIn: true,
      role,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(() => {
    console.log("[AuthContext] Logout called");
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    setAuthState({
      isLoggedIn: false,
      role: null,
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
