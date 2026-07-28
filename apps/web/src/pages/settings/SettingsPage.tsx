import React, { useState, useEffect } from "react";
import { clsx } from "clsx";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, Monitor, Download, AlertTriangle, Power, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/hooks/useAuth";
import { profileApi } from "@/services/profile";
import { ApiError } from "@/services/api";

type ThemeOption = "dark" | "light" | "system";

const themeOptions: {
  value: ThemeOption;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}[] = [
  { value: "dark", label: "Dark Mode", icon: Moon },
  { value: "light", label: "Light Mode", icon: Sun },
  { value: "system", label: "System Default", icon: Monitor },
];

// Read notification preferences from user or use defaults
function getNotifPrefs(user: ReturnType<typeof useAuth>["user"]) {
  return {
    budgetAlerts: user?.notificationPreferences?.budgetAlerts ?? true,
    emailWarnings: user?.notificationPreferences?.emailWarnings ?? true,
    weeklyDigest: user?.notificationPreferences?.weeklyDigest ?? false,
  };
}

/**
 * Settings page — theme, currency, language, notifications, and danger zone.
 * Route: /settings
 */
export const SettingsPage: React.FC = () => {
  const { user, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const prefs = getNotifPrefs(user);

  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>(
    (user?.theme as ThemeOption) ?? "dark"
  );
  const [currency, setCurrency] = useState(user?.currency ?? "USD");
  const [language, setLanguage] = useState(user?.language ?? "en-US");
  const [dateFormat, setDateFormat] = useState(user?.dateFormat ?? "YYYY-MM-DD");
  const [timeZone, setTimeZone] = useState(user?.timeZone ?? "UTC");
  const [budgetAlerts, setBudgetAlerts] = useState(prefs.budgetAlerts);
  const [emailWarnings, setEmailWarnings] = useState(prefs.emailWarnings);
  const [weeklyDigest, setWeeklyDigest] = useState(prefs.weeklyDigest);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [prefsLoading, setPrefsLoading] = useState(false);

  // Password confirmation state for destructive actions
  const [confirmPassword, setConfirmPassword] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Sync form state when user data loads asynchronously
  useEffect(() => {
    if (user) {
      setSelectedTheme((user?.theme as ThemeOption) ?? "dark");
      setCurrency(user?.currency ?? "USD");
      setLanguage(user?.language ?? "en-US");
      setDateFormat(user?.dateFormat ?? "YYYY-MM-DD");
      setTimeZone(user?.timeZone ?? "UTC");
      const syncedPrefs = getNotifPrefs(user);
      setBudgetAlerts(syncedPrefs.budgetAlerts);
      setEmailWarnings(syncedPrefs.emailWarnings);
      setWeeklyDigest(syncedPrefs.weeklyDigest);
    }
  }, [user]);

  const handleSavePreferences = async () => {
    setPrefsLoading(true);
    try {
      await profileApi.updateProfile({
        theme: selectedTheme,
        timeZone,
        currency,
        language,
        dateFormat,
        notificationPreferences: {
          budgetAlerts,
          emailWarnings,
          weeklyDigest,
        },
      });
      await refreshProfile();
      toast.success("Preferences saved");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to save preferences";
      toast.error("Save failed", { description: message });
    } finally {
      setPrefsLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!confirmPassword) {
      toast.error("Password is required");
      return;
    }

    setActionLoading(true);
    try {
      const message = await profileApi.deactivateAccount(confirmPassword);
      setShowDeactivateDialog(false);
      setConfirmPassword("");
      await logout();
      toast.success(message);
      navigate("/login", { replace: true });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to deactivate account";
      toast.error("Deactivation failed", { description: message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirmPassword) {
      toast.error("Password is required");
      return;
    }

    setActionLoading(true);
    try {
      await profileApi.deleteAccount(confirmPassword);
      setShowDeleteDialog(false);
      setConfirmPassword("");
      await logout();
      toast.success("Account deleted permanently");
      navigate("/login", { replace: true });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to delete account";
      toast.error("Delete failed", { description: message });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6 pb-20 lg:pb-0 animate-[fade-in_0.3s_ease-out]">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Settings</h2>
        <p className="text-sm text-text-secondary mt-1">
          Configure your workspace preferences
        </p>
      </div>

      {/* Theme */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-base font-semibold text-text-primary mb-4">
          Visual Theme & Appearance
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedTheme(opt.value)}
              className={clsx(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                selectedTheme === opt.value
                  ? "border-primary bg-primary/5"
                  : "border-border-card hover:border-text-muted/30",
              )}
            >
              <opt.icon
                className={clsx(
                  "size-6",
                  selectedTheme === opt.value ? "text-primary" : "text-text-muted",
                )}
              />
              <span
                className={clsx(
                  "text-sm font-medium",
                  selectedTheme === opt.value ? "text-primary" : "text-text-secondary",
                )}
              >
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Regional & Time Zone */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-base font-semibold text-text-primary mb-4">
          Regional & Time Zone
        </h3>
        <div className="space-y-4">
          <Select
            label="Default Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            options={[
              { value: "USD", label: "USD ($) — US Dollar" },
              { value: "EUR", label: "EUR (€) — Euro" },
              { value: "GBP", label: "GBP (£) — British Pound" },
              { value: "EGP", label: "EGP (E£) — Egyptian Pound" },
              { value: "CAD", label: "CAD (C$) — Canadian Dollar" },
              { value: "AUD", label: "AUD (A$) — Australian Dollar" },
              { value: "JPY", label: "JPY (¥) — Japanese Yen" },
            ]}
          />
          <Select
            label="Display Language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            options={[
              { value: "en-US", label: "English (US)" },
              { value: "en-GB", label: "English (UK)" },
              { value: "ar-EG", label: "Arabic (Egypt)" },
            ]}
          />
          <Select
            label="Time Zone"
            value={timeZone}
            onChange={(e) => setTimeZone(e.target.value)}
            options={[
              { value: "UTC", label: "UTC — Coordinated Universal Time" },
              { value: "America/New_York", label: "Eastern Time (US & Canada)" },
              { value: "America/Chicago", label: "Central Time (US & Canada)" },
              { value: "America/Denver", label: "Mountain Time (US & Canada)" },
              { value: "America/Los_Angeles", label: "Pacific Time (US & Canada)" },
              { value: "America/Vancouver", label: "Pacific Time (Vancouver)" },
              { value: "America/Toronto", label: "Eastern Time (Toronto)" },
              { value: "America/Sao_Paulo", label: "Brasília Time (Brazil)" },
              { value: "America/Mexico_City", label: "Central Time (Mexico)" },
              { value: "Europe/London", label: "GMT/BST — United Kingdom" },
              { value: "Europe/Paris", label: "CET/CEST — Central Europe" },
              { value: "Europe/Berlin", label: "CET/CEST — Germany" },
              { value: "Europe/Amsterdam", label: "CET/CEST — Netherlands" },
              { value: "Europe/Madrid", label: "CET/CEST — Spain" },
              { value: "Europe/Rome", label: "CET/CEST — Italy" },
              { value: "Europe/Stockholm", label: "CET/CEST — Sweden" },
              { value: "Europe/Moscow", label: "MSK/MSD — Moscow" },
              { value: "Africa/Cairo", label: "EET — Cairo (Egypt)" },
              { value: "Africa/Casablanca", label: "WET/WEST — Morocco" },
              { value: "Africa/Johannesburg", label: "SAST — South Africa" },
              { value: "Asia/Dubai", label: "GST — UAE" },
              { value: "Asia/Riyadh", label: "AST — Saudi Arabia" },
              { value: "Asia/Kolkata", label: "IST — India" },
              { value: "Asia/Shanghai", label: "CST — China" },
              { value: "Asia/Tokyo", label: "JST — Japan" },
              { value: "Asia/Seoul", label: "KST — South Korea" },
              { value: "Asia/Singapore", label: "SGT — Singapore" },
              { value: "Australia/Sydney", label: "AEST/AEDT — Australia (East)" },
              { value: "Australia/Melbourne", label: "AEST/AEDT — Melbourne" },
              { value: "Pacific/Auckland", label: "NZST/NZDT — New Zealand" },
            ]}
          />
          <Select
            label="Date Format"
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value)}
            options={[
              { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2026-07-28)" },
              { value: "MM/DD/YYYY", label: "MM/DD/YYYY (07/28/2026)" },
              { value: "DD/MM/YYYY", label: "DD/MM/YYYY (28/07/2026)" },
            ]}
          />
        </div>
      </div>

      {/* Notifications */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-base font-semibold text-text-primary mb-4">
          Notification Preferences
        </h3>
        <div className="space-y-4">
          <Checkbox
            label="Budget Threshold Alerts (toast when category budget hits 80%)"
            checked={budgetAlerts}
            onChange={setBudgetAlerts}
          />
          <Checkbox
            label="Email Over-Budget Warnings (email on 100% budget cap)"
            checked={emailWarnings}
            onChange={setEmailWarnings}
          />
          <Checkbox
            label="Weekly Spending Summary Digest"
            checked={weeklyDigest}
            onChange={setWeeklyDigest}
          />
        </div>
      </div>

      {/* Save All Preferences */}
      <div className="glass rounded-xl p-6 flex justify-end">
        <Button onClick={handleSavePreferences} isLoading={prefsLoading} size="lg">
          Save All Preferences
        </Button>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border-2 border-error/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="size-5 text-error" />
          <h3 className="text-base font-semibold text-error">Danger Zone</h3>
        </div>

        {/* Download Backup */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-text-primary">Download Full Backup</p>
            <p className="text-xs text-text-muted mt-1">
              Export all your data as a JSON file
            </p>
          </div>
          <Button variant="outline" size="sm" leftIcon={<Download className="size-4" />}>
            Download JSON
          </Button>
        </div>

        <hr className="my-4 border-border-card" />

        {/* Deactivate Account */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-text-primary">Deactivate Account</p>
            <p className="text-xs text-text-muted mt-1">
              Temporarily disable your account. Your data is preserved and can be restored later.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Power className="size-4" />}
            className="text-warning/80 border-warning/30 hover:bg-warning/10"
            onClick={() => setShowDeactivateDialog(true)}
          >
            Deactivate
          </Button>
        </div>

        <hr className="my-4 border-border-card" />

        {/* Delete Account */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-error">Permanently Delete Account</p>
            <p className="text-xs text-text-muted mt-1">
              This action cannot be undone. All data will be lost.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 className="size-4" />}
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete Account
          </Button>
        </div>
      </div>

      {/* Deactivate Account Confirmation */}
      <Modal
        isOpen={showDeactivateDialog}
        onClose={() => {
          setShowDeactivateDialog(false);
          setConfirmPassword("");
        }}
        title="Deactivate Your Account?"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Your account will be temporarily disabled. Your transactions, categories, budgets, and
            all other data will be preserved. You can reactivate by logging in again.
          </p>
          <Input
            label="Confirm your password"
            type="password"
            placeholder="Enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setShowDeactivateDialog(false);
                setConfirmPassword("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeactivateAccount}
              isLoading={actionLoading}
              leftIcon={<Power className="size-4" />}
            >
              Deactivate Account
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Confirmation */}
      <Modal
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setConfirmPassword("");
        }}
        title="Delete Your Account?"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            This will permanently delete your account, all transactions, categories, budgets, and
            settings. This action cannot be undone.
          </p>
          <Input
            label="Confirm your password"
            type="password"
            placeholder="Enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setShowDeleteDialog(false);
                setConfirmPassword("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              isLoading={actionLoading}
              leftIcon={<Trash2 className="size-4" />}
            >
              Permanently Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
