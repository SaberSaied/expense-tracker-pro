import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { clsx } from "clsx";

/**
 * Register page — onboards new users and creates a workspace account.
 * Route: /register
 */
export const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /** Password strength calculation. */
  const passwordStrength = useMemo(() => {
    if (!password) return { level: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: score, label: "Weak", color: "bg-error" };
    if (score <= 3) return { level: score, label: "Medium", color: "bg-warning" };
    return { level: score, label: "Strong", color: "bg-success" };
  }, [password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
      <div className="text-center mb-2">
        <h2 className="text-lg font-semibold text-text-primary">
          Create Your Pro Account
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Start tracking your finances in seconds
        </p>
      </div>

      <Input
        label="Full Name"
        type="text"
        placeholder="Alex Rivera"
        value={name}
        onChange={(e) => setName(e.target.value)}
        leftIcon={<User className="size-4" />}
        autoComplete="name"
        required
      />

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

      <div className="space-y-2">
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Create a strong password"
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
        {/* Password strength meter */}
        {password && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((seg) => (
                <div
                  key={seg}
                  className={clsx(
                    "h-1 flex-1 rounded-full transition-colors",
                    seg <= passwordStrength.level
                      ? passwordStrength.color
                      : "bg-white/10",
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-text-muted">
              Strength:{" "}
              <span className={clsx("font-medium", passwordStrength.level <= 2 ? "text-error" : passwordStrength.level <= 3 ? "text-warning" : "text-success")}>
                {passwordStrength.label}
              </span>
            </p>
          </div>
        )}
      </div>

      <Input
        label="Confirm Password"
        type="password"
        placeholder="Re-enter your password"
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

      <Checkbox label="I agree to the Terms of Service & Privacy Policy" />

      <Button
        type="submit"
        className="w-full"
        size="lg"
        isLoading={isLoading}
      >
        Create Account
      </Button>

      <p className="text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-primary hover:text-primary-hover font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
};
