import React from "react";
import { Outlet } from "react-router-dom";
import { TrendingUp } from "lucide-react";

/**
 * Shared authentication layout with centered glassmorphic card,
 * radial emerald gradient background, and brand identity header.
 */
export const AuthLayout: React.FC = () => {
  return (
    <div className="auth-layout min-h-dvh flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-bg-app" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/6 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-accent/5 blur-[80px]" />
      </div>

      {/* Auth card */}
      <div className="relative w-full max-w-md">
        <div className="glass-heavy rounded-2xl shadow-modal p-8 sm:p-10">
          {/* Brand header */}
          <div className="flex flex-col items-center mb-8">
            <div className="size-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-4">
              <TrendingUp className="size-7 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-text-primary">
              Expense Tracker
              <span className="gradient-text ml-1">Pro</span>
            </h1>
          </div>

          {/* Page content outlet */}
          <Outlet />
        </div>

        {/* Decorative bottom text */}
        <p className="text-center text-xs text-text-muted mt-6">
          &copy; {new Date().getFullYear()} Expense Tracker Pro. All rights reserved.
        </p>
      </div>
    </div>
  );
};
