/**
 * Authentication API service.
 * All functions call the backend auth endpoints.
 */
import { api, tokenStorage } from "./api";
export { tokenStorage };

// ─── Types ────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  avatarUrl: string | null;
  bio?: string | null;
  theme?: "dark" | "light" | "system";
  timeZone?: string;
  currency?: string;
  language?: string;
  dateFormat?: string;
  emailVerified?: boolean;
  createdAt?: string;
  notificationPreferences?: {
    budgetAlerts: boolean;
    emailWarnings: boolean;
    weeklyDigest: boolean;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    tokens: AuthTokens;
  };
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

// ─── API Functions ────────────────────────────────────────────

export const authApi = {
  async login(input: LoginInput) {
    const response = await api.postPublic<AuthResponse>("/auth/login", input);
    const { user, tokens } = response.data;
    tokenStorage.setAccessToken(tokens.accessToken);
    tokenStorage.setRefreshToken(tokens.refreshToken);
    return user;
  },

  async register(input: RegisterInput) {
    const response = await api.postPublic<AuthResponse>("/auth/register", input);
    const { user, tokens } = response.data;
    tokenStorage.setAccessToken(tokens.accessToken);
    tokenStorage.setRefreshToken(tokens.refreshToken);
    return user;
  },

  async logout() {
    try {
      await api.postPublic("/auth/logout");
    } finally {
      tokenStorage.clear();
    }
  },

  async getProfile() {
    const response = await api.get<{ success: boolean; data: { user: User } }>("/auth/me");
    return response.data.user;
  },

  async refreshToken() {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) throw new Error("No refresh token");

    const response = await api.postPublic<{ success: boolean; data: { tokens: AuthTokens } }>(
      "/auth/refresh",
      { refreshToken },
    );

    const { tokens } = response.data;
    tokenStorage.setAccessToken(tokens.accessToken);
    tokenStorage.setRefreshToken(tokens.refreshToken);
    return tokens;
  },

  async forgotPassword(email: string) {
    return api.postPublic<{ success: boolean; message: string }>("/auth/forgot-password", {
      email,
    });
  },

  async resetPassword(token: string, password: string) {
    return api.postPublic<{ success: boolean; message: string }>("/auth/reset-password", {
      token,
      password,
    });
  },
};
