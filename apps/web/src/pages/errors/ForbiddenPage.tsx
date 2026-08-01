import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldX } from "lucide-react";
import { ErrorPage } from "@/components/ui/ErrorPage";

/**
 * 403 Forbidden — authenticated but not permitted to access this resource.
 * Route: /forbidden
 */
export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ErrorPage
      code="403"
      icon={ShieldX}
      title="Access Denied"
      description="You don't have permission to view this page. If you believe this is a mistake, contact your administrator."
      iconColor="text-error"
      primaryLabel="Back to Dashboard"
      onPrimary={() => navigate("/dashboard")}
      secondaryLabel="Go Back"
      onSecondary={() => navigate(-1)}
    />
  );
};
