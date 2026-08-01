import React from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { ErrorPage } from "@/components/ui/ErrorPage";

/**
 * 401 Unauthorized — session expired or credentials missing.
 * Route: /unauthorized
 */
export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ErrorPage
      code="401"
      icon={Lock}
      title="Session Expired"
      description="Your session has expired. Please sign in again to continue managing your finances."
      iconColor="text-warning"
      primaryLabel="Sign In"
      onPrimary={() => navigate("/login")}
      secondaryLabel="Back to Dashboard"
      onSecondary={() => navigate("/dashboard")}
    />
  );
};
