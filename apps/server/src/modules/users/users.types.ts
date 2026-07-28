export interface UpdateProfileInput {
  name?: string;
  bio?: string;
  avatarUrl?: string;
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
