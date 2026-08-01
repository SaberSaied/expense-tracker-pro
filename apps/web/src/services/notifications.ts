/**
 * Notifications API service.
 * In-app notification bell: list, unread count, mark read, delete.
 */
import { api } from "./api";

export type NotificationType =
  | "BUDGET_WARNING"
  | "BUDGET_CRITICAL"
  | "EXPORT_COMPLETE"
  | "WEEKLY_DIGEST"
  | "REMINDER"
  | "MONTHLY_SUMMARY"
  | "BILL_DUE_SOON"
  | "BILL_OVERDUE";

/** Notification as returned from the API (Prisma model fields). */
export interface ApiNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  dedupKey: string | null;
  userId: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface FindAllOptions {
  page?: number;
  limit?: number;
  read?: boolean;
  type?: string;
}

export const notificationsApi = {
  /**
   * GET /notifications — list the user's notifications (newest first).
   */
  async findAll(options: FindAllOptions = {}): Promise<{
    notifications: ApiNotification[];
    total: number;
  }> {
    const params = new URLSearchParams();
    if (options.page) params.set("page", String(options.page));
    if (options.limit) params.set("limit", String(options.limit));
    if (options.read !== undefined) params.set("read", String(options.read));
    if (options.type) params.set("type", options.type);
    const query = params.toString();
    const response = await api.get<ApiResponse<{ notifications: ApiNotification[] }>>(
      `/notifications${query ? `?${query}` : ""}`,
    );
    return {
      notifications: response.data.notifications,
      total: response.meta?.total ?? response.data.notifications.length,
    };
  },

  /**
   * GET /notifications/unread/count — number of unread notifications.
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get<ApiResponse<{ count: number }>>("/notifications/unread/count");
    return response.data.count;
  },

  /**
   * PATCH /notifications/:id/read — mark a single notification as read.
   */
  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  /**
   * PATCH /notifications/read-all — mark every notification as read.
   */
  async markAllAsRead(): Promise<void> {
    await api.patch("/notifications/read-all");
  },

  /**
   * DELETE /notifications/:id — permanently remove a notification.
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
};
