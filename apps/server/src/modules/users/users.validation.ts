import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  firstName: z.string().min(1, "First name is required").max(50).optional(),
  lastName: z.string().min(1, "Last name is required").max(50).optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")
    .optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z
    .string()
    .optional()
    .refine(
      (v) => v === undefined || v === "" || /^https?:\/\//.test(v) || v.startsWith("/uploads/"),
      "Invalid avatar URL (must be an http(s) URL or an app /uploads path)"
    ),
  theme: z.enum(["dark", "light", "system"]).optional(),
  timeZone: z.string().min(1, "Time zone is required").max(50).optional(),
  currency: z.string().length(3, "Currency must be a 3-letter code").optional(),
  language: z.string().min(2).max(10).optional(),
  dateFormat: z.string().min(1).max(20).optional(),
  notificationPreferences: z
    .object({
      budgetAlerts: z.boolean().optional(),
      emailWarnings: z.boolean().optional(),
      weeklyDigest: z.boolean().optional(),
    })
    .optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(128, "New password must be at most 128 characters")
    .regex(/[A-Z]/, "New password must contain at least one uppercase letter")
    .regex(/[a-z]/, "New password must contain at least one lowercase letter")
    .regex(/[0-9]/, "New password must contain at least one number"),
});

export const deactivateAccountSchema = z.object({
  password: z.string().min(1, "Password is required to deactivate your account"),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required to delete your account"),
});
