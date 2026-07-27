import React, { useState } from "react";
import { clsx } from "clsx";
import {
  Sun,
  Moon,
  Monitor,
  Download,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { MOCK_USER } from "@/data";

type ThemeOption = "dark" | "light" | "system";

const themeOptions: { value: ThemeOption; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
  { value: "dark", label: "Dark Mode", icon: Moon },
  { value: "light", label: "Light Mode", icon: Sun },
  { value: "system", label: "System Default", icon: Monitor },
];

/**
 * Settings page — theme, currency, language, notifications, and danger zone.
 * Route: /settings
 */
export const SettingsPage: React.FC = () => {
  const user = MOCK_USER;
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>(user.theme);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
              <opt.icon className={clsx("size-6", selectedTheme === opt.value ? "text-primary" : "text-text-muted")} />
              <span className={clsx("text-sm font-medium", selectedTheme === opt.value ? "text-primary" : "text-text-secondary")}>
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Currency & Regional */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-base font-semibold text-text-primary mb-4">
          Currency & Regional
        </h3>
        <div className="space-y-4">
          <Select
            label="Default Currency"
            options={[
              { value: "USD", label: "USD ($) — US Dollar" },
              { value: "EUR", label: "EUR (€) — Euro" },
              { value: "GBP", label: "GBP (£) — British Pound" },
              { value: "EGP", label: "EGP (E£) — Egyptian Pound" },
            ]}
            defaultValue={user.currency}
          />
          <Select
            label="Display Language"
            options={[
              { value: "en-US", label: "English (US)" },
              { value: "en-GB", label: "English (UK)" },
              { value: "ar-EG", label: "Arabic (Egypt)" },
            ]}
            defaultValue={user.language}
          />
          <Select
            label="Date Format"
            options={[
              { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2026-07-28)" },
              { value: "MM/DD/YYYY", label: "MM/DD/YYYY (07/28/2026)" },
              { value: "DD/MM/YYYY", label: "DD/MM/YYYY (28/07/2026)" },
            ]}
            defaultValue={user.dateFormat}
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
            defaultChecked={user.notifications.budgetAlerts}
          />
          <Checkbox
            label="Email Over-Budget Warnings (email on 100% budget cap)"
            defaultChecked={user.notifications.emailWarnings}
          />
          <Checkbox
            label="Weekly Spending Summary Digest"
            defaultChecked={user.notifications.weeklyDigest}
          />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border-2 border-error/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="size-5 text-error" />
          <h3 className="text-base font-semibold text-error">
            Danger Zone
          </h3>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-text-primary">
              Download Full Backup
            </p>
            <p className="text-xs text-text-muted mt-1">
              Export all your data as a JSON file
            </p>
          </div>
          <Button variant="outline" size="sm" leftIcon={<Download className="size-4" />}>
            Download JSON
          </Button>
        </div>
        <hr className="my-4 border-border-card" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-error">
              Permanently Delete Account
            </p>
            <p className="text-xs text-text-muted mt-1">
              This action cannot be undone. All data will be lost.
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={() => setShowDeleteDialog(true)}>
            Delete Account
          </Button>
        </div>
      </div>

      {/* Delete Account Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => setShowDeleteDialog(false)}
        title="Delete Your Account?"
        description="This will permanently delete your account, all transactions, categories, budgets, and settings. This action cannot be undone."
        confirmLabel="Permanently Delete"
      />
    </div>
  );
};
