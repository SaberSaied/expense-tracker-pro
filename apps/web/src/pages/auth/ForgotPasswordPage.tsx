import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

/**
 * Forgot password page — initiates password recovery via email.
 * Route: /forgot-password
 */
export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center text-center py-4">
        <div className="size-16 rounded-full bg-success/15 flex items-center justify-center mb-4">
          <CheckCircle className="size-8 text-success" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary mb-2">
          Check Your Inbox
        </h2>
        <p className="text-sm text-text-secondary mb-6 max-w-xs">
          We&apos;ve sent a password reset link to{" "}
          <span className="font-medium text-text-primary">{email}</span>.
        </p>
        <Link
          to="/login"
          className="text-sm text-primary hover:text-primary-hover font-medium transition-colors"
        >
          ← Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" id="forgot-password-form">
      <div className="text-center mb-2">
        <h2 className="text-lg font-semibold text-text-primary">
          Reset Your Password
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Enter your email and we&apos;ll send a recovery link
        </p>
      </div>

      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftIcon={<Mail className="size-4" />}
        autoComplete="email"
        required
      />

      <Button
        type="submit"
        className="w-full"
        size="lg"
        isLoading={isLoading}
      >
        Send Reset Link
      </Button>

      <Link
        to="/login"
        className="flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Sign In
      </Link>
    </form>
  );
};
