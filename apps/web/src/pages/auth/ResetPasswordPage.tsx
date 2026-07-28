import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { authApi } from "@/services/auth";
import { ApiError } from "@/services/api";

/**
 * Reset password page — set a new password using a verified token.
 * Route: /reset-password?token=...
 */
export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid reset link", {
        description: "No reset token found in the URL.",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const result = await authApi.resetPassword(token, password);
      toast.success("Password updated", { description: result.message });
      setIsSuccess(true);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      toast.error("Reset failed", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center text-center py-4">
        <div className="size-16 rounded-full bg-error/15 flex items-center justify-center mb-4">
          <Lock className="size-8 text-error" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary mb-2">Invalid Reset Link</h2>
        <p className="text-sm text-text-secondary mb-6">
          This password reset link is missing or invalid. Please request a new one.
        </p>
        <Link
          to="/forgot-password"
          className="text-sm text-primary hover:text-primary-hover font-medium transition-colors"
        >
          Request New Reset Link →
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center text-center py-4">
        <div className="size-16 rounded-full bg-success/15 flex items-center justify-center mb-4">
          <CheckCircle className="size-8 text-success" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary mb-2">Password Updated</h2>
        <p className="text-sm text-text-secondary mb-6">
          Your password has been changed successfully.
        </p>
        <Link
          to="/login"
          className="text-sm text-primary hover:text-primary-hover font-medium transition-colors"
        >
          Continue to Sign In →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" id="reset-password-form">
      <div className="text-center mb-2">
        <h2 className="text-lg font-semibold text-text-primary">Set New Password</h2>
        <p className="text-sm text-text-secondary mt-1">
          Choose a strong password for your account
        </p>
      </div>

      <Input
        label="New Password"
        type={showPassword ? "text" : "password"}
        placeholder="Enter new password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        leftIcon={<Lock className="size-4" />}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-text-muted hover:text-text-primary transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        }
        autoComplete="new-password"
        required
      />

      <Input
        label="Confirm New Password"
        type="password"
        placeholder="Re-enter new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        leftIcon={<Lock className="size-4" />}
        error={
          confirmPassword && confirmPassword !== password
            ? "Passwords do not match"
            : undefined
        }
        autoComplete="new-password"
        required
      />

      <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
        Update Password
      </Button>
    </form>
  );
};
