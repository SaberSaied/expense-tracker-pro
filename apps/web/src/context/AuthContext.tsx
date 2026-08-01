/**
 * Authentication context providing user state and auth actions.
 */
import React, { createContext, useState, useEffect, useCallback } from "react";
import type { User } from "@/services/auth";
import { authApi, tokenStorage } from "@/services/auth";
import { ApiError } from "@/services/api";

// ─── Types ────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  /** Clears the local session without calling the API — used on session expiry. */
  clearSession: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    // Start loading only when a stored token exists — otherwise skip the
    // mount check entirely and avoid a synchronous setState in an effect.
    const hasToken = !!tokenStorage.getAccessToken();
    return {
      user: null,
      isAuthenticated: false,
      isLoading: hasToken,
    };
  });

  // Check for existing session on mount
  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (!token) return;

    // Try to load the user profile with the stored token
    authApi
      .getProfile()
      .then((user) => {
        setState({ user, isAuthenticated: true, isLoading: false });
      })
      .catch(() => {
        // Token invalid or expired — try refreshing
        tokenStorage.clear();
        setState({ user: null, isAuthenticated: false, isLoading: false });
      });
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const user = await authApi.login({ email, password });
    setState({ user, isAuthenticated: true, isLoading: false });
    return user;
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<User> => {
      const user = await authApi.register({ name, email, password });
      setState({ user, isAuthenticated: true, isLoading: false });
      return user;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if the API call fails, clear local state
    }
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const user = await authApi.getProfile();
      setState((prev) => ({ ...prev, user }));
    } catch {
      // If refresh fails and we have no user, log out
      setState((prev) => {
        if (!prev.user) return { user: null, isAuthenticated: false, isLoading: false };
        return prev;
      });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearSession,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, ApiError };
