/**
 * Profile and user management API service.
 */
import { api, tokenStorage, API_BASE_URL } from "./api";
import type { User } from "./auth";

// ─── Types ────────────────────────────────────────────────────

export interface UpdateProfileInput {
  name?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  theme?: "dark" | "light" | "system";
  timeZone?: string;
  currency?: string;
  language?: string;
  dateFormat?: string;
  notificationPreferences?: {
    budgetAlerts?: boolean;
    emailWarnings?: boolean;
    weeklyDigest?: boolean;
  };
}

export interface UpdatePasswordInput {
  currentPassword: string;
  newPassword: string;
}

// ─── API Functions ────────────────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const profileApi = {
  /**
   * GET /api/v1/users/me
   * Returns the authenticated user's profile (sensitive fields excluded).
   */
  async getProfile(): Promise<User> {
    const response = await api.get<ApiResponse<{ user: User }>>("/users/me");
    return response.data.user;
  },

  /**
   * PATCH /api/v1/users/me
   * Updates profile fields. Returns the updated user.
   */
  async updateProfile(input: UpdateProfileInput): Promise<User> {
    const response = await api.patch<ApiResponse<{ user: User }>>("/users/me", input);
    return response.data.user;
  },

  /**
   * POST /api/v1/users/me/avatar
   * Uploads a new avatar image. Accepts FormData with 'avatar' field.
   */
  async uploadAvatar(file: File): Promise<{ user: User; avatarUrl: string }> {
    const formData = new FormData();
    formData.append("avatar", file);

    const token = tokenStorage.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message ?? "Failed to upload avatar");
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * DELETE /api/v1/users/me/avatar
   * Removes the user's avatar.
   */
  async removeAvatar(): Promise<User> {
    const response = await api.delete<ApiResponse<{ user: User }>>("/users/me/avatar");
    return response.data.user;
  },

  /**
   * POST /api/v1/users/me/password
   * Changes the account password (requires current password verification).
   */
  async updatePassword(input: UpdatePasswordInput): Promise<string> {
    const response = await api.post<{ success: boolean; message: string }>(
      "/users/me/password",
      input,
    );
    return response.message;
  },

  /**
   * POST /api/v1/users/me/deactivate
   * Soft-deactivates the account. Data is preserved but login is blocked.
   */
  async deactivateAccount(password: string): Promise<string> {
    const response = await api.post<{ success: boolean; message: string }>("/users/me/deactivate", {
      password,
    });
    return response.message;
  },

  /**
   * POST /api/v1/users/me/reactivate
   * Reactivates a deactivated account.
   */
  async reactivateAccount(): Promise<User> {
    const response = await api.post<ApiResponse<{ user: User }>>("/users/me/reactivate");
    return response.data.user;
  },

  /**
   * DELETE /api/v1/users/me
   * Permanently deletes the account and all associated data.
   * Requires password confirmation.
   */
  async deleteAccount(password: string): Promise<void> {
    await api.delete("/users/me", { data: { password } });
  },
};
