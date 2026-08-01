import React from "react";
import { useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";
import { ErrorPage } from "@/components/ui/ErrorPage";

/**
 * 404 Not Found — shown for unknown routes.
 * Route: catch-all (`*`)
 */
export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ErrorPage
      code="404"
      icon={Compass}
      title="Page Not Found"
      description="The page you're looking for doesn't exist or may have been moved. Check the URL or head back to your dashboard."
      iconColor="text-warning"
      primaryLabel="Back to Dashboard"
      onPrimary={() => navigate("/dashboard")}
      secondaryLabel="Go Back"
      onSecondary={() => navigate(-1)}
    />
  );
};
