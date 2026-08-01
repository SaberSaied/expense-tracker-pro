import React from "react";
import { useNavigate } from "react-router-dom";
import { FileWarning } from "lucide-react";
import { ErrorPage } from "@/components/ui/ErrorPage";

/**
 * Validation Error — shown when submitted data fails validation
 * (e.g. after a 400 response with `details`).
 * Route: /validation-error
 */
export const ValidationErrorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ErrorPage
      code="400"
      icon={FileWarning}
      title="Please Check Your Input"
      description="Some of the information you entered didn't pass validation. Review the highlighted fields and try again."
      iconColor="text-warning"
      primaryLabel="Try Again"
      onPrimary={() => navigate(-1)}
      secondaryLabel="Back to Dashboard"
      onSecondary={() => navigate("/dashboard")}
    />
  );
};
