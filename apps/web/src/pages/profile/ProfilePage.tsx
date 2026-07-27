import React, { useState } from "react";
import { Camera, Trash2, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { MOCK_USER } from "@/data";

/**
 * Profile page — personal information, avatar, and password management.
 * Route: /profile
 */
export const ProfilePage: React.FC = () => {
  const user = MOCK_USER;
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  return (
    <div className="max-w-2xl space-y-6 pb-20 lg:pb-0 animate-[fade-in_0.3s_ease-out]">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Profile</h2>
        <p className="text-sm text-text-secondary mt-1">
          Manage your personal information and security
        </p>
      </div>

      {/* Avatar Section */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-base font-semibold text-text-primary mb-4">
          Avatar
        </h3>
        <div className="flex items-center gap-6">
          <Avatar initials={user.name.split(" ").map(n => n[0]).join("")} size="xl" />
          <div className="space-y-3">
            <div>
              <p className="text-lg font-semibold text-text-primary">{user.name}</p>
              <p className="text-sm text-text-secondary">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" leftIcon={<Camera className="size-3.5" />}>
                Upload Photo
              </Button>
              <Button variant="ghost" size="sm" className="text-error/70 hover:text-error" leftIcon={<Trash2 className="size-3.5" />}>
                Remove
              </Button>
            </div>
            <p className="text-xs text-text-muted">Max size: 2MB (.png, .jpg, .webp)</p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-base font-semibold text-text-primary mb-4">
          Personal Information
        </h3>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <Input label="Full Name" defaultValue={user.name} />
          <Input label="Email Address" type="email" defaultValue={user.email} />
          <Input label="Job Title / Bio" defaultValue={user.bio} />
          <div className="flex justify-end pt-2">
            <Button type="submit">Save Profile Changes</Button>
          </div>
        </form>
      </div>

      {/* Security */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="size-5 text-text-muted" />
          <h3 className="text-base font-semibold text-text-primary">
            Password & Security
          </h3>
        </div>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <Input
            label="Current Password"
            type={showCurrentPw ? "text" : "password"}
            placeholder="Enter current password"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label={showCurrentPw ? "Hide" : "Show"}
              >
                {showCurrentPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
          />
          <Input
            label="New Password"
            type={showNewPw ? "text" : "password"}
            placeholder="Enter new password"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label={showNewPw ? "Hide" : "Show"}
              >
                {showNewPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
          />
          <Input label="Confirm New Password" type="password" placeholder="Re-enter new password" />
          <div className="flex justify-end pt-2">
            <Button type="submit">Update Password</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
