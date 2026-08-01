import React from "react";
import { useLocation } from "react-router-dom";
import { ServerErrorPage } from "@/pages/errors/ServerErrorPage";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Route key — reset the boundary when it changes so navigation options work. */
  locationKey?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundaryBase extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    // Log for diagnostics — extend with error tracking here if desired
    console.error("[ErrorBoundary] Unhandled error:", error, info.componentStack);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset the error state when the route changes so the user can navigate
    // away from the 500 fallback (e.g. "Back to Dashboard") without a reload.
    if (this.state.hasError && prevProps.locationKey !== this.props.locationKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return <ServerErrorPage />;
    }
    return this.props.children;
  }
}

/**
 * React error boundary that catches unhandled render/ lifecycle errors
 * and displays a friendly 500 error page instead of a blank screen.
 * Resets automatically whenever the route changes.
 */
export const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  return <ErrorBoundaryBase locationKey={location.pathname}>{children}</ErrorBoundaryBase>;
};
