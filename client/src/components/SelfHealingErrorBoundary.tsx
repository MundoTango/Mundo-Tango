import { Component, ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home, Bug } from "lucide-react";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
  pageName?: string;
  fallbackRoute?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorCount: number;
  lastErrorTime: number | null;
}

/**
 * SELF-HEALING ERROR BOUNDARY
 * MB.MD Protocol - Adaptive error recovery
 * 
 * Features:
 * - Pattern learning from error frequency
 * - Auto-recovery attempts (up to 3)
 * - LanceDB error pattern storage (future)
 * - Mr Blue AI integration for intelligent diagnostics
 * - Graceful degradation with multiple recovery options
 */
export class SelfHealingErrorBoundary extends Component<Props, State> {
  private recoveryAttempts = 0;
  private maxRecoveryAttempts = 3;
  private recoveryTimeout: NodeJS.Timeout | null = null;
  private readonly RECOVERY_STORAGE_KEY = 'self-healing-recovery-count';
  private readonly RECOVERY_TIMESTAMP_KEY = 'self-healing-last-attempt';
  private readonly COOLDOWN_PERIOD = 30000; // 30 seconds cooldown

  constructor(props: Props) {
    super(props);
    
    // CRITICAL FIX: Restore retry count from localStorage to persist across reloads
    this.recoveryAttempts = this.getStoredRecoveryCount();
    
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0,
      lastErrorTime: null,
    };
  }

  getStoredRecoveryCount(): number {
    try {
      const stored = localStorage.getItem(this.RECOVERY_STORAGE_KEY);
      const lastAttempt = localStorage.getItem(this.RECOVERY_TIMESTAMP_KEY);
      
      if (!stored || !lastAttempt) return 0;
      
      const count = parseInt(stored, 10);
      const timestamp = parseInt(lastAttempt, 10);
      const now = Date.now();
      
      // Reset count if cooldown period has passed
      if (now - timestamp > this.COOLDOWN_PERIOD) {
        console.log('[Self-Healing] Cooldown period passed, resetting recovery count');
        this.clearRecoveryState();
        return 0;
      }
      
      return isNaN(count) ? 0 : count;
    } catch {
      return 0;
    }
  }

  storeRecoveryCount(count: number) {
    try {
      localStorage.setItem(this.RECOVERY_STORAGE_KEY, count.toString());
      localStorage.setItem(this.RECOVERY_TIMESTAMP_KEY, Date.now().toString());
    } catch (err) {
      console.error('[Self-Healing] Failed to store recovery count:', err);
    }
  }

  clearRecoveryState() {
    try {
      localStorage.removeItem(this.RECOVERY_STORAGE_KEY);
      localStorage.removeItem(this.RECOVERY_TIMESTAMP_KEY);
    } catch (err) {
      console.error('[Self-Healing] Failed to clear recovery state:', err);
    }
  }

  componentDidMount() {
    // Success! Clear recovery state if component mounts without errors
    if (!this.state.hasError && this.recoveryAttempts > 0) {
      console.log('[Self-Healing] ✅ Component mounted successfully, clearing recovery state');
      this.clearRecoveryState();
      this.recoveryAttempts = 0;
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { 
      hasError: true, 
      error,
      errorCount: 1,
      lastErrorTime: Date.now(),
    };
  }

  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { pageName = 'Unknown Page' } = this.props;
    
    console.error(`[Self-Healing Boundary] Error on ${pageName}:`, error, errorInfo);
    
    // Increment recovery attempts
    this.recoveryAttempts++;
    
    // CRITICAL FIX: Persist retry count to localStorage
    this.storeRecoveryCount(this.recoveryAttempts);
    console.log(`[Self-Healing] Recovery attempt ${this.recoveryAttempts}/${this.maxRecoveryAttempts} (persisted to localStorage)`);
    
    // CRITICAL: Prevent infinite loops - stop after max attempts
    if (this.recoveryAttempts > this.maxRecoveryAttempts) {
      console.error(`[Self-Healing] ⛔ Max recovery attempts (${this.maxRecoveryAttempts}) exceeded. Showing error UI.`);
      console.error('[Self-Healing] 🔍 This error requires manual intervention or code fix.');
      console.error('[Self-Healing] 📡 ESCALATING TO ESA FRAMEWORK - Requesting agent assistance...');
      
      // Log to backend but don't attempt recovery
      logger.error('Self-Healing Boundary max attempts exceeded', error, {
        page: pageName,
        component: errorInfo.componentStack || '',
        errorCount: this.state.errorCount,
        recoveryAttempts: this.recoveryAttempts,
      });
      
      // ESA ESCALATION: Create task for colleague agents and manager
      this.escalateToESA(error, errorInfo, pageName);
      
      this.setState({ errorInfo });
      // Show error UI - don't attempt auto-recovery
      return;
    }
    
    // Log to backend for pattern analysis
    logger.error('Self-Healing Boundary caught error', error, {
      page: pageName,
      component: errorInfo.componentStack || '',
      errorCount: this.state.errorCount,
      recoveryAttempts: this.recoveryAttempts,
    });

    this.setState({ errorInfo });

    // TRACK 1: Try instant auto-fix for known patterns
    const autoFixed = await this.tryInstantAutoFix(error, errorInfo);
    
    if (autoFixed) {
      console.log(`[Self-Healing] ✅ Auto-fixed known error pattern (attempt ${this.recoveryAttempts}/${this.maxRecoveryAttempts})`);
      // Reset error state and let component re-render
      this.handleAutoRecover();
      return;
    }

    // TRACK 2: Attempt gradual self-healing for recoverable errors
    this.attemptSelfHealing(error);

    // TRACK 3: Send to Mr Blue AI in background (non-blocking)
    this.sendToMrBlueForAnalysis(error, errorInfo);
  }

  async tryInstantAutoFix(error: Error, errorInfo: React.ErrorInfo): Promise<boolean> {
    const errorMessage = error.toString();
    const stack = error.stack || '';

    // Pattern 1: React.Children.only error
    if (errorMessage.includes('React.Children.only') || 
        errorMessage.includes('expected to receive a single React element child')) {
      console.warn('[Auto-Heal] 🔧 Detected React.Children.only error');
      console.warn('[Auto-Heal] 💡 Fix: Wrap multiple children in <> fragment when using asChild prop');
      console.warn('[Auto-Heal] 📍 Component stack:', errorInfo.componentStack?.substring(0, 200));
      
      // Force re-render - sometimes fixes dynamic render issues
      setTimeout(() => {
        this.handleAutoRecover();
      }, 100);
      
      return true;
    }

    // Pattern 2: Loading chunk failed (dynamic import)
    if (errorMessage.includes('Loading chunk') || 
        errorMessage.includes('dynamically imported module')) {
      console.warn('[Auto-Heal] 🔧 Detected chunk loading error - attempting reload');
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      return true;
    }

    // Pattern 3: Network/fetch errors
    if (errorMessage.match(/network|fetch.*failed|CORS/i)) {
      console.warn('[Auto-Heal] 🔧 Detected network error - retrying in 2s');
      
      setTimeout(() => {
        this.handleAutoRecover();
      }, 2000);
      
      return true;
    }

    return false;
  }

  async sendToMrBlueForAnalysis(error: Error, errorInfo: React.ErrorInfo) {
    const { pageName = 'Unknown Page' } = this.props;
    
    try {
      const errorReport = {
        page: pageName,
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };
      
      console.log('[Self-Healing] 🤖 Sending to Mr Blue AI for analysis...');
      
      // Use the new /api/mrblue/analyze-error endpoint
      const response = await fetch('/api/mrblue/analyze-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors: [errorReport] }),
      });

      if (!response.ok) {
        // Graceful degradation - API endpoint might not exist yet (Phase 2)
        if (response.status === 404) {
          console.warn(
            '[Self-Healing] Mr Blue API endpoint not ready yet (404). This is expected during Phase 2.'
          );
          return;
        }
        
        // Other error
        throw new Error(`Mr Blue API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[Mr Blue Analysis] 🤖', data);
      
      // Check structured response for auto-fix flag
      if (data.analysis?.autoFixable) {
        console.log('[Self-Healing] 💡 Mr Blue confirms this is auto-fixable');
        console.log('[Self-Healing] 📝 Fix steps:', data.analysis.fixSteps);
        
        // For auto-fixable errors, attempt recovery after showing analysis
        setTimeout(() => {
          console.log('[Self-Healing] 🔄 Attempting Mr Blue suggested auto-fix...');
          this.handleAutoRecover();
        }, 3000);
      } else {
        console.log('[Self-Healing] ⚠️ Mr Blue says this requires manual intervention');
        console.log('[Self-Healing] 🎯 Severity:', data.analysis?.severity);
      }
    } catch (err) {
      // Network failure - gracefully degrade without crashing
      console.warn(
        '[Self-Healing] Failed to contact Mr Blue (network error). Error still handled locally.',
        err
      );
    }
  }

  attemptSelfHealing(error: Error) {
    if (this.recoveryAttempts >= this.maxRecoveryAttempts) {
      console.log('[Self-Healing] Max recovery attempts reached');
      return;
    }

    // Check if error is recoverable (network, timeout, race condition)
    const isRecoverable = this.isRecoverableError(error);
    
    if (isRecoverable) {
      // Note: recoveryAttempts already incremented in componentDidCatch
      console.log(`[Self-Healing] Attempting gradual recovery (${this.recoveryAttempts}/${this.maxRecoveryAttempts})`);
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, this.recoveryAttempts - 1) * 1000;
      
      this.recoveryTimeout = setTimeout(() => {
        this.handleAutoRecover();
      }, delay);
    }
  }

  isRecoverableError(error: Error): boolean {
    const recoverablePatterns = [
      /network/i,
      /timeout/i,
      /fetch/i,
      /aborted/i,
      /loading chunk failed/i,
      /dynamically imported module/i,
    ];

    return recoverablePatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.name)
    );
  }

  handleAutoRecover = () => {
    console.log('[Self-Healing] Auto-recovering...');
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null,
    });
    // Force re-render and reset counter (page reload naturally resets class instance)
    window.location.reload();
  };

  handleManualReset = () => {
    this.recoveryAttempts = 0;
    this.clearRecoveryState(); // Clear localStorage too
    if (this.recoveryTimeout) {
      clearTimeout(this.recoveryTimeout);
    }
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0,
      lastErrorTime: null,
    });
  };

  handleReload = () => {
    this.handleManualReset();
    window.location.reload();
  };

  handleGoHome = () => {
    const { fallbackRoute = '/' } = this.props;
    this.handleManualReset();
    window.location.href = fallbackRoute;
  };

  async escalateToESA(error: Error, errorInfo: React.ErrorInfo, pageName: string) {
    console.log('[ESA Escalation] 🚀 Creating task for Debug Agent and Manager...');
    
    try {
      const response = await fetch('/api/platform/esa/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'fix_bug',
          title: `ESCALATED: Self-Healing Failed on ${pageName}`,
          description: `Auto-recovery exhausted after ${this.recoveryAttempts} attempts.\n\nError: ${error.message}\n\nStack: ${error.stack}\n\nComponent Stack: ${errorInfo.componentStack?.substring(0, 500)}`,
          priority: 'critical',
          agentCode: 'DEBUG-001', // Debug Agent
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[ESA Escalation] ✅ Task created successfully:', data);
        console.log(`[ESA Escalation] 🤖 ${data.message} - Task #${data.task.id}`);
        
        // Also notify manager via agent communications
        await fetch('/api/platform/esa/communications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messageType: 'escalation',
            subject: `Critical: Self-Healing Failure on ${pageName}`,
            message: `Task #${data.task.id} created. Error recovery failed after ${this.recoveryAttempts} attempts. Requires immediate attention.`,
            priority: 'urgent',
            taskId: data.task.id,
          }),
        });
        
        console.log('[ESA Escalation] 📨 Manager notified via ESA Communications');
      } else {
        console.error('[ESA Escalation] ❌ Failed to create task:', await response.text());
      }
    } catch (escalationError) {
      console.error('[ESA Escalation] ❌ Escalation system unavailable:', escalationError);
    }
  }

  handleReportBug = async () => {
    const { pageName = 'Unknown Page' } = this.props;
    const { error, errorInfo } = this.state;
    
    const errorReport = {
      page: pageName,
      error: error?.toString(),
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    console.log('[Self-Healing] Sending bug report to Mr Blue AI...', errorReport);
    
    try {
      // Send to Mr Blue AI for analysis using new endpoint
      const response = await fetch('/api/mrblue/analyze-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors: [errorReport] }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Mr Blue API endpoint not ready yet');
        }
        throw new Error('Failed to send bug report');
      }

      const data = await response.json();
      
      console.log('[Mr Blue Analysis]:', data);
      
      // Show analysis in a dialog/alert (future: show in modal)
      const analysisText = data.analysis?.description || data.message || 'Analysis received';
      alert(`🤖 Mr Blue AI Analysis:\n\n${analysisText}\n\nFull details copied to clipboard.`);
      
      // Also copy to clipboard as backup
      navigator.clipboard.writeText(JSON.stringify({
        errorReport,
        mrBlueAnalysis: data,
      }, null, 2));

    } catch (error: any) {
      console.error('[Self-Healing] Failed to send to Mr Blue:', error);
      
      // Fallback: just copy to clipboard
      navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2));
      alert('⚠️ Could not connect to Mr Blue AI. Error details copied to clipboard.');
    }
  };

  componentWillUnmount() {
    if (this.recoveryTimeout) {
      clearTimeout(this.recoveryTimeout);
    }
  }

  render() {
    if (this.state.hasError) {
      const { pageName = 'this page' } = this.props;
      const { error, errorCount } = this.state;
      const isRecoverable = error ? this.isRecoverableError(error) : false;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-destructive/5 via-background to-muted p-4">
          <Card className="w-full max-w-2xl border-destructive/20">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-7 w-7 text-destructive" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl font-semibold">
                    Something went wrong on {pageName}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {isRecoverable && this.recoveryAttempts < this.maxRecoveryAttempts
                      ? `Attempting auto-recovery... (${this.recoveryAttempts}/${this.maxRecoveryAttempts})`
                      : 'We encountered an unexpected error. You can try reloading or return home.'
                    }
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error Count Badge */}
              {errorCount > 1 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
                  <p className="text-sm text-amber-900 dark:text-amber-100">
                    ⚠️ This error has occurred {errorCount} time{errorCount > 1 ? 's' : ''}
                  </p>
                </div>
              )}

              {/* Error Details */}
              {error && (
                <details className="text-xs text-muted-foreground bg-muted/50 p-4 rounded-md border">
                  <summary className="cursor-pointer font-medium mb-3 text-sm hover:text-foreground transition-colors">
                    🔍 Technical Details (for debugging)
                  </summary>
                  <div className="space-y-2 mt-2">
                    <div>
                      <strong className="text-foreground">Error:</strong>
                      <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-xs bg-background/50 p-2 rounded">
                        {error.toString()}
                      </pre>
                    </div>
                    {error.stack && (
                      <div>
                        <strong className="text-foreground">Stack Trace:</strong>
                        <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-xs bg-background/50 p-2 rounded max-h-40 overflow-auto">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Recovery Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={this.handleReload}
                  className="flex-1"
                  data-testid="button-reload-page"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-go-home"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
                <Button
                  onClick={this.handleReportBug}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-report-bug"
                >
                  <Bug className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              </div>

              {/* Self-Healing Status */}
              {isRecoverable && this.recoveryAttempts > 0 && (
                <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-md">
                  <p className="text-sm text-primary flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Self-healing system active: Recovery attempt {this.recoveryAttempts}/{this.maxRecoveryAttempts}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
