import React from "react";
import { useNavigate } from "react-router-dom";
import { WifiOff } from "lucide-react";
import { ErrorPage } from "@/components/ui/ErrorPage";

/**
 * Network Error — shown when the app cannot reach the server (offline / API down).
 * Route: /network-error
 */
export const NetworkErrorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ErrorPage
      code="Offline"
      icon={WifiOff}
      title="No Internet Connection"
      description="We couldn't reach our servers. Check your connection and try again — your data is safe and will sync once you're back online."
      iconColor="text-accent"
      onRetry={() => window.location.reload()}
      primaryLabel="Back to Dashboard"
      onPrimary={() => navigate("/dashboard")}
      secondaryLabel="Go Back"
      onSecondary={() => navigate(-1)}
    />
  );
};
