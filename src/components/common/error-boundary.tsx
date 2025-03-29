import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode; // Optional custom fallback UI
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary component to catch and handle JavaScript errors in child components
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // You could log the error to an external service here
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="text-red-500 p-4 border border-red-500 rounded-md text-center">
          <h2>Something went wrong.</h2>
          <p>Please try refreshing the page.</p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
             <pre className="mt-2 text-xs text-left whitespace-pre-wrap">
               {this.state.error.toString()}
               {this.state.error.stack}
             </pre>
           )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 