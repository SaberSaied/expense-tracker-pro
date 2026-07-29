import { prisma } from "@/db/prisma";

export const notificationRepository = {
  async findAllByUser(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async findUnreadByUser(userId: string) {
    return prisma.notification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: string) {
    return prisma.notification.findUnique({ where: { id } });
  },

  async create(userId: string, data: {
    type: string;
    title: string;
    message: string;
  }) {
    return prisma.notification.create({
      data: {
        type: data.type as any,
        title: data.title,
        message: data.message,
        userId,
      },
    });
  },

  async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  },

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  },

  async delete(id: string) {
    return prisma.notification.delete({ where: { id } });
  },

  async countUnread(userId: string) {
    return prisma.notification.count({
      where: { userId, read: false },
    });
  },
};
