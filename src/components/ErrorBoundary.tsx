import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | null;
  errorInfo?: React.ErrorInfo | null;
  resetKey: number;
}

// Fix REason: Add an Error Boundary to capture render-time errors and show a friendly fallback UI
// This prevents the whole app from crashing when a single subtree (e.g., Wallet or TradingChart)
// throws during render/effects. We also provide a retry button to remount children.
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, resetKey: 0 };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can send error telemetry here
    // eslint-disable-next-line no-console
    console.error('Uncaught error in component subtree:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    // Bump resetKey to force remounting of children
    this.setState((s) => ({ hasError: false, error: null, errorInfo: null, resetKey: s.resetKey + 1 }));
  };

  renderFallback() {
    const { error, errorInfo } = this.state;
    return (
      <div className="p-6 m-6 bg-[#1B1D22] border border-deti-border rounded-lg text-white">
        <h3 className="text-lg font-bold mb-2">Something went wrong</h3>
        <div className="text-sm text-deti-subtext mb-3">An unexpected error occurred. You can try to reload this section.</div>
        <div className="flex gap-2">
          <button onClick={this.handleReset} className="px-3 py-2 bg-deti-primary text-white rounded">Retry</button>
          <button onClick={() => window.location.reload()} className="px-3 py-2 bg-deti-card border border-deti-border text-deti-text rounded">Reload Page</button>
        </div>
        {error && (
          <details className="mt-3 text-xs text-deti-subtext bg-deti-bg/50 p-3 rounded">
            <summary className="cursor-pointer">Error details</summary>
            <pre className="whitespace-pre-wrap">{String(error.message)}{errorInfo ? '\n' + errorInfo.componentStack : ''}</pre>
          </details>
        )}
      </div>
    );
  }

  render() {
    const { fallback } = this.props;
    const { hasError, resetKey } = this.state;
    if (hasError) {
      return <div key={`error-fallback-${resetKey}`}>{fallback ?? this.renderFallback()}</div>;
    }
    // Give children a stable key so they remount when we increment resetKey
    return <div key={`error-boundary-${resetKey}`}>{this.props.children}</div>;
  }
}

export default ErrorBoundary;
