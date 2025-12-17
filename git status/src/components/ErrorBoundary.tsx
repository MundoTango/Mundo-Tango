import { Component, ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
  autoRecoveryAttempted: boolean;
}

/**
 * SELF-HEALING ERROR BOUNDARY (Enhanced November 16, 2025)
 * 
 * Automatically attempts recovery after React errors:
 * - First error: Auto-reset after 3 seconds (silent)
 * - Second error: Auto-reset after 5 seconds (shows warning)
 * - Third error: Shows error UI with manual recovery
 */
export class ErrorBoundary extends Component<Props, State> {
  private resetTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorCount: 0,
      autoRecoveryAttempted: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { errorCount } = this.state;
    
    console.error("Error caught by boundary:", error, errorInfo);
    logger.error('React Error Boundary caught error', error, {
      component: errorInfo.componentStack || '',
      errorCount: errorCount + 1,
    });

    // Update error count
    this.setState(prev => ({ errorCount: prev.errorCount + 1 }));

    // AUTO-RECOVERY LOGIC (MB.MD Protocol v7.1 - Self-Healing)
    if (errorCount === 0) {
      // First error: Silent auto-recovery after 3s
      console.log('[ErrorBoundary] 🔄 First error detected. Auto-recovery in 3 seconds...');
      this.resetTimeout = setTimeout(() => {
        console.log('[ErrorBoundary] ✅ Auto-recovery attempt 1/3');
        this.handleAutoReset();
      }, 3000);
    } else if (errorCount === 1) {
      // Second error: Slower auto-recovery after 5s
      console.log('[ErrorBoundary] ⚠️ Second error detected. Auto-recovery in 5 seconds...');
      this.resetTimeout = setTimeout(() => {
        console.log('[ErrorBoundary] ✅ Auto-recovery attempt 2/3');
        this.handleAutoReset();
      }, 5000);
    } else {
      // Third+ error: Show error UI, no auto-recovery
      console.error('[ErrorBoundary] ❌ Max errors reached (3). Manual intervention required.');
    }
  }

  componentWillUnmount() {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
  }

  handleAutoReset = () => {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
      this.resetTimeout = null;
    }

    this.setState({
      hasError: false,
      error: null,
      autoRecoveryAttempted: true,
    });
  };

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorCount: 0 });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-muted p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-serif">
                    Oops! Something went wrong
                  </CardTitle>
                  <CardDescription>
                    We encountered an unexpected error
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The application ran into a problem and couldn't continue. Please try reloading the page.
              </p>
              {this.state.error && (
                <details className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                  <summary className="cursor-pointer font-medium mb-2">
                    Error details (for debugging)
                  </summary>
                  <pre className="whitespace-pre-wrap break-words">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
              <Button
                onClick={this.handleReload}
                className="w-full"
                data-testid="button-reload"
              >
                Reload Page
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
