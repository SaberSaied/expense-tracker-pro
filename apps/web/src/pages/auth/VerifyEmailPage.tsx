import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

type VerifyState = "loading" | "success" | "error";

/**
 * Email verification page — confirms user email ownership via token.
 * Route: /verify-email?token=...
 */
export const VerifyEmailPage: React.FC = () => {
  const [state, setState] = useState<VerifyState>("loading");

  useEffect(() => {
    // Simulate token verification
    const timer = setTimeout(() => {
      setState(Math.random() > 0.3 ? "success" : "error");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center text-center py-4">
      {state === "loading" && (
        <>
          <div className="size-16 rounded-full bg-primary/15 flex items-center justify-center mb-4 animate-[pulse-ring_2s_infinite]">
            <Loader2 className="size-8 text-primary animate-spin" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            Verifying Your Email
          </h2>
          <p className="text-sm text-text-secondary">
            Please wait while we confirm your email address...
          </p>
        </>
      )}

      {state === "success" && (
        <>
          <div className="size-16 rounded-full bg-success/15 flex items-center justify-center mb-4">
            <CheckCircle className="size-8 text-success" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            Email Verified!
          </h2>
          <p className="text-sm text-text-secondary mb-6">
            Your email has been confirmed. You&apos;re all set!
          </p>
          <Link to="/dashboard">
            <Button size="md">Proceed to Dashboard</Button>
          </Link>
        </>
      )}

      {state === "error" && (
        <>
          <div className="size-16 rounded-full bg-error/15 flex items-center justify-center mb-4">
            <XCircle className="size-8 text-error" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            Link Expired or Invalid
          </h2>
          <p className="text-sm text-text-secondary mb-6">
            This verification link is no longer valid.
          </p>
          <Button size="md" variant="outline">
            Resend Verification Email
          </Button>
        </>
      )}
    </div>
  );
};
