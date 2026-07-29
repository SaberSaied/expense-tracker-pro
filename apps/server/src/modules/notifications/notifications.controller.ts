import type { Response, NextFunction } from "express";
import { notificationService } from "./notifications.service";
import { sendSuccess, sendNoContent } from "@/common/responses";
import type { AuthenticatedRequest } from "@/common/types";

export const notificationController = {
  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const notifications = await notificationService.findAll(req.user.id);
      sendSuccess(res, { notifications });
    } catch (err) {
      next(err);
    }
  },

  async findUnread(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const notifications = await notificationService.findUnread(req.user.id);
      sendSuccess(res, { notifications });
    } catch (err) {
      next(err);
    }
  },

  async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const count = await notificationService.getUnreadCount(req.user.id);
      sendSuccess(res, { count });
    } catch (err) {
      next(err);
    }
  },

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.markAsRead(req.user.id, req.params.id as string);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  },

  async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.user.id);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.delete(req.user.id, req.params.id as string);
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  },
};
