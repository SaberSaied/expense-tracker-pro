import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/api";

/**
 * Login page — authenticates existing users via email and password.
 * Route: /login
 */
export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      toast.error("Login failed", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
      <div className="text-center mb-2">
        <h2 className="text-lg font-semibold text-text-primary">Welcome Back</h2>
        <p className="text-sm text-text-secondary mt-1">
          Sign in to continue tracking your expenses
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

      <Input
        label="Password"
        type={showPassword ? "text" : "password"}
        placeholder="Enter your password"
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
        autoComplete="current-password"
        required
      />

      <div className="flex items-center justify-between">
        <Checkbox label="Remember me" />
        <Link
          to="/forgot-password"
          className="text-sm text-primary hover:text-primary-hover transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
        Sign In
      </Button>

      <p className="text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link
          to="/register"
          className="text-primary hover:text-primary-hover font-medium transition-colors"
        >
          Create one
        </Link>
      </p>
    </form>
  );
};
