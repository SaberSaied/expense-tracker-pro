import React, { useState, useEffect, useRef } from "react";
import { Camera, Trash2, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/hooks/useAuth";
import { profileApi } from "@/services/profile";
import { ApiError } from "@/services/api";
import type { UpdateProfileInput, UpdatePasswordInput } from "@/services/profile";

/**
 * Profile page — personal information, avatar, and password management.
 * Route: /profile
 */
export const ProfilePage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Profile form state
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [profileLoading, setProfileLoading] = useState(false);

  // Avatar upload state
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Sync form fields when user data changes
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setUsername(user.username ?? "");
      setBio(user.bio ?? "");
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);

    try {
      const input: UpdateProfileInput = {
        firstName,
        lastName,
        name: [firstName, lastName].filter(Boolean).join(" ") || undefined,
        username,
        bio,
      };
      await profileApi.updateProfile(input);
      await refreshProfile();
      toast.success("Profile updated successfully");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to update profile";
      toast.error("Update failed", { description: message });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Only JPEG, PNG, WebP, and GIF are allowed.",
      });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large", { description: "Maximum size is 2MB." });
      return;
    }

    setAvatarUploading(true);
    try {
      await profileApi.uploadAvatar(file);
      await refreshProfile();
      toast.success("Avatar updated");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload avatar";
      toast.error("Upload failed", { description: message });
    } finally {
      setAvatarUploading(false);
      // Reset the file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarUploading(true);
    try {
      await profileApi.removeAvatar();
      await refreshProfile();
      toast.success("Avatar removed");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to remove avatar";
      toast.error("Remove failed", { description: message });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setPasswordLoading(true);

    try {
      const input: UpdatePasswordInput = { currentPassword, newPassword };
      await profileApi.updatePassword(input);
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to update password";
      toast.error("Password update failed", { description: message });
    } finally {
      setPasswordLoading(false);
    }
  };

  const displayName = [firstName, lastName].filter(Boolean).join(" ") || user?.name || "User";
  const userInitials = [firstName, lastName]
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .join("")
    .slice(0, 2) || "U";

  const hasAvatar = !!user?.avatarUrl;

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
        <h3 className="text-base font-semibold text-text-primary mb-4">Avatar</h3>
        <div className="flex items-center gap-6">
          <div className="relative">
            {hasAvatar ? (
              <img
                src={user!.avatarUrl!}
                alt={displayName}
                className="size-20 rounded-full object-cover border-2 border-border-card"
              />
            ) : (
              <Avatar initials={userInitials} size="xl" />
            )}
            {avatarUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                <Loader2 className="size-6 text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-lg font-semibold text-text-primary">{displayName}</p>
              <p className="text-sm text-text-secondary">{user?.email ?? ""}</p>
              {username && <p className="text-xs text-text-muted">@{username}</p>}
            </div>
            <div className="flex items-center gap-2">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.gif"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Camera className="size-3.5" />}
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
              >
                {avatarUploading ? "Uploading..." : "Upload Photo"}
              </Button>
              {hasAvatar && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-error/70 hover:text-error"
                  leftIcon={<Trash2 className="size-3.5" />}
                  onClick={handleRemoveAvatar}
                  disabled={avatarUploading}
                >
                  Remove
                </Button>
              )}
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
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Alex"
              required
            />
            <Input
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Rivera"
              required
            />
          </div>
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="alexrivera"
            helperText="Must be unique. Letters, numbers, underscores, and hyphens only."
          />
          <Input
            label="Email Address"
            type="email"
            defaultValue={user?.email ?? ""}
            disabled
            helperText="Email cannot be changed"
          />
          <Input
            label="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Senior Software Consultant"
          />
          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={profileLoading}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Security */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="size-5 text-text-muted" />
          <h3 className="text-base font-semibold text-text-primary">Password & Security</h3>
        </div>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Current Password"
            type={showCurrentPw ? "text" : "password"}
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
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
            required
          />
          <Input
            label="New Password"
            type={showNewPw ? "text" : "password"}
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
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
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={
              confirmPassword && confirmPassword !== newPassword
                ? "Passwords do not match"
                : undefined
            }
            required
          />
          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={passwordLoading}>
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
