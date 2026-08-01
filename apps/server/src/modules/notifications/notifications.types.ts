/**
 * Notification preference flags stored in the User model's `notificationPreferences` JSON field.
 */
export interface NotificationPreferences {
  /** Enable/disable all notifications globally */
  enabled: boolean;

  /** Send budget warning alerts when spending approaches the limit */
  budgetAlerts: boolean;

  /** Send budget critical alerts when spending exceeds the limit */
  budgetCriticalAlerts: boolean;

  /** Send email warnings for budget alerts */
  emailWarnings: boolean;

  /** Send weekly digest of spending summary */
  weeklyDigest: boolean;

  /** Send monthly summary report */
  monthlySummary: boolean;

  /** Preferred time of day for notification delivery (HH:mm format, 24h) */
  reminderTime: string;

  /** Future-ready notification channels configuration */
  channels: {
    /** In-app notification bell */
    inApp: boolean;
    /** Email notifications */
    email: boolean;
    /** Push notifications (mobile) */
    push: boolean;
  };
}

/**
 * Input type for updating notification preferences.
 * All fields are optional for partial updates.
 */
export type NotificationPreferencesInput = Partial<NotificationPreferences>;

/**
 * Default notification preferences used when a new user registers.
 */
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  budgetAlerts: true,
  budgetCriticalAlerts: true,
  emailWarnings: true,
  weeklyDigest: false,
  monthlySummary: false,
  reminderTime: "09:00",
  channels: {
    inApp: true,
    email: true,
    push: false,
  },
};
