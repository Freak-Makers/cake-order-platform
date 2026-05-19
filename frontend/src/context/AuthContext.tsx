"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { UserInfo } from "@/api/types";

interface AuthContextType {
  isLoggedIn: boolean;
  role: string | null;
  userInfo: UserInfo | null;
  isLoading: boolean;
  login: (token: string, role: string | null, userInfo?: UserInfo | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "accessToken";
const ROLE_KEY = "userRole";
const USER_INFO_KEY = "userInfo";
const FRESH_SESSION_KEY = "authSessionStarted";

function readStoredUserInfo(): UserInfo | null {
  const raw = localStorage.getItem(USER_INFO_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserInfo;
  } catch {
    // 손상된 값은 무시하고 정리
    localStorage.removeItem(USER_INFO_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<{
    isLoggedIn: boolean;
    role: string | null;
    userInfo: UserInfo | null;
    isLoading: boolean;
  }>({
    isLoggedIn: false,
    role: null,
    userInfo: null,
    isLoading: true,
  });
  const router = useRouter();

  // 초기화: 새 브라우저 세션의 첫 진입이면 토큰/role/userInfo 를 비우고 시작 (서버/탭 재시작 후 로그아웃 상태)
  useEffect(() => {
    if (!sessionStorage.getItem(FRESH_SESSION_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ROLE_KEY);
      localStorage.removeItem(USER_INFO_KEY);
      sessionStorage.setItem(FRESH_SESSION_KEY, "1");
    }
    const token = localStorage.getItem(TOKEN_KEY);
    const role = localStorage.getItem(ROLE_KEY);
    const userInfo = readStoredUserInfo();
    console.log("[AuthContext] Initializing, token found:", !!token, "role:", role);
    setAuthState({
      isLoggedIn: !!token,
      role,
      userInfo,
      isLoading: false,
    });
  }, []);

  const login = useCallback((token: string, role: string | null, userInfo: UserInfo | null = null) => {
    console.log("[AuthContext] Login called, role:", role);
    localStorage.setItem(TOKEN_KEY, token);
    if (role) {
      localStorage.setItem(ROLE_KEY, role);
    } else {
      localStorage.removeItem(ROLE_KEY);
    }
    if (userInfo) {
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
    } else {
      localStorage.removeItem(USER_INFO_KEY);
    }
    setAuthState({
      isLoggedIn: true,
      role,
      userInfo,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(() => {
    console.log("[AuthContext] Logout called");
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_INFO_KEY);
    setAuthState({
      isLoggedIn: false,
      role: null,
      userInfo: null,
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
