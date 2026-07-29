import { notificationRepository } from "./notifications.repository";
import { NotFoundError } from "@/common/errors";

export const notificationService = {
  async findAll(userId: string) {
    return notificationRepository.findAllByUser(userId);
  },

  async findUnread(userId: string) {
    return notificationRepository.findUnreadByUser(userId);
  },

  async findById(userId: string, id: string) {
    const notification = await notificationRepository.findById(id);
    if (!notification || notification.userId !== userId) {
      throw new NotFoundError("Notification not found");
    }
    return notification;
  },

  async markAsRead(userId: string, id: string) {
    const notification = await notificationRepository.findById(id);
    if (!notification || notification.userId !== userId) {
      throw new NotFoundError("Notification not found");
    }
    return notificationRepository.markAsRead(id);
  },

  async markAllAsRead(userId: string) {
    return notificationRepository.markAllAsRead(userId);
  },

  async delete(userId: string, id: string) {
    const notification = await notificationRepository.findById(id);
    if (!notification || notification.userId !== userId) {
      throw new NotFoundError("Notification not found");
    }
    return notificationRepository.delete(id);
  },

  async getUnreadCount(userId: string) {
    return notificationRepository.countUnread(userId);
  },
};
