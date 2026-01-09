import { Component, ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Bug } from "lucide-react";
import { logger } from "@/lib/logger";
import { apiRequest } from "@/lib/queryClient";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorCount: number;
  autoRecoveryAttempted: boolean;
  reportSent: boolean;
}

// Store captured error for QA system access
let lastCapturedError: { error: Error; componentStack: string; timestamp: number } | null = null;

export function getLastCapturedError() {
  return lastCapturedError;
}

export function clearCapturedError() {
  lastCapturedError = null;
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
      errorInfo: null,
      errorCount: 0,
      autoRecoveryAttempted: false,
      reportSent: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { errorCount } = this.state;
    
    // Store error for QA system access
    lastCapturedError = {
      error,
      componentStack: errorInfo.componentStack || '',
      timestamp: Date.now(),
    };
    
    // Store errorInfo in state for the Report Bug button
    this.setState({ errorInfo });
    
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
    this.setState({ hasError: false, error: null, errorCount: 0, reportSent: false });
    window.location.reload();
  };

  handleReportBug = async () => {
    const { error, errorInfo } = this.state;
    if (!error) return;
    
    try {
      await apiRequest("POST", "/api/qa-platform/feedback", {
        feedbackType: "bug",
        title: `React Crash: ${error.message.substring(0, 50)}`,
        description: `**Automatic Bug Report - React Error Boundary**

**Error:** ${error.message}

**Stack Trace:**
\`\`\`
${error.stack || 'No stack available'}
\`\`\`

**Component Stack:**
\`\`\`
${errorInfo?.componentStack || 'No component stack available'}
\`\`\`

**Browser:** ${navigator.userAgent}
**URL:** ${window.location.href}
**Timestamp:** ${new Date().toISOString()}`,
        currentPage: window.location.pathname,
        sessionSnapshot: {
          browserInfo: {
            userAgent: navigator.userAgent,
            viewport: { width: window.innerWidth, height: window.innerHeight },
            language: navigator.language,
            platform: navigator.platform,
          }
        },
        priority: "critical",
        sessionId: sessionStorage.getItem('mt_session_id') || 'unknown',
      });
      
      this.setState({ reportSent: true });
    } catch (err) {
      console.error('[ErrorBoundary] Failed to send bug report:', err);
    }
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
              <div className="flex gap-2">
                <Button
                  onClick={this.handleReload}
                  className="flex-1"
                  data-testid="button-reload"
                >
                  Reload Page
                </Button>
                <Button
                  onClick={this.handleReportBug}
                  variant="outline"
                  className="flex-1"
                  disabled={this.state.reportSent}
                  data-testid="button-report-crash"
                >
                  <Bug className="h-4 w-4 mr-2" />
                  {this.state.reportSent ? 'Reported' : 'Report Bug'}
                </Button>
              </div>
              {this.state.reportSent && (
                <p className="text-xs text-center text-green-600">
                  Bug report sent to developers. Thank you!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
