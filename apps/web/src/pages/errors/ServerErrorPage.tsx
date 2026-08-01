import React from "react";
import { useNavigate } from "react-router-dom";
import { ServerCrash } from "lucide-react";
import { ErrorPage } from "@/components/ui/ErrorPage";

/**
 * 500 Internal Server Error — shown when the server fails unexpectedly.
 * Route: /500 (also used by the ErrorBoundary fallback)
 */
export const ServerErrorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ErrorPage
      code="500"
      icon={ServerCrash}
      title="Something Went Wrong"
      description="An unexpected error occurred on our end. Please try again — if the problem persists, we've already been notified."
      iconColor="text-error"
      onRetry={() => window.location.reload()}
      primaryLabel="Back to Dashboard"
      onPrimary={() => navigate("/dashboard")}
    />
  );
};
