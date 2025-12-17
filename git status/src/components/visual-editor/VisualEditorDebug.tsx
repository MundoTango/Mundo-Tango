/**
 * Visual Editor Debug Panel
 * Real-time diagnostics for iframe injection and element selection
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bug, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface DebugLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

interface VisualEditorDebugProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  iframeReady: boolean;
  selectedComponent: any;
}

export function VisualEditorDebug({ iframeRef, iframeReady, selectedComponent }: VisualEditorDebugProps) {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [diagnostics, setDiagnostics] = useState({
    iframeAccessible: false,
    scriptInjected: false,
    eventListenersActive: false,
    postMessageWorks: false,
    crossOrigin: false
  });

  // Intercept console logs from iframe
  useEffect(() => {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args) => {
      if (args[0]?.includes?.('[VisualEditor]')) {
        addLog('info', args.join(' '));
      }
      originalLog.apply(console, args);
    };

    console.warn = (...args) => {
      if (args[0]?.includes?.('[VisualEditor]')) {
        addLog('warn', args.join(' '));
      }
      originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      if (args[0]?.includes?.('[VisualEditor]')) {
        addLog('error', args.join(' '));
      }
      originalError.apply(console, args);
    };

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  const addLog = (level: DebugLog['level'], message: string) => {
    setLogs(prev => [...prev.slice(-49), {
      timestamp: new Date(),
      level,
      message
    }]);
  };

  const runDiagnostics = () => {
    addLog('info', 'Running diagnostics...');
    
    const iframe = iframeRef.current;
    if (!iframe) {
      addLog('error', 'Iframe ref is null');
      return;
    }

    const results = {
      iframeAccessible: false,
      scriptInjected: false,
      eventListenersActive: false,
      postMessageWorks: false,
      crossOrigin: false
    };

    try {
      // Test 1: Can we access iframe document?
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        results.iframeAccessible = true;
        addLog('success', '✅ Iframe document accessible');

        // Test 2: Is script injected?
        const scriptElement = doc.querySelector('[data-visual-editor-script="true"]');
        if (scriptElement) {
          results.scriptInjected = true;
          addLog('success', '✅ Selection script found in DOM');
        } else {
          addLog('error', '❌ Selection script NOT found in DOM');
        }

        // Test 3: Check for cross-origin
        try {
          const origin = doc.location.origin;
          results.crossOrigin = origin !== window.location.origin;
          if (results.crossOrigin) {
            addLog('warn', `⚠️ Cross-origin detected: ${origin}`);
          } else {
            addLog('success', '✅ Same origin');
          }
        } catch (e) {
          results.crossOrigin = true;
          addLog('error', '❌ Cross-origin restriction detected');
        }
      } else {
        addLog('error', '❌ Cannot access iframe document');
      }

      // Test 4: PostMessage communication
      if (iframe.contentWindow) {
        results.postMessageWorks = true;
        addLog('success', '✅ PostMessage available');
        
        // Send test message
        iframe.contentWindow.postMessage({
          type: 'DEBUG_PING'
        }, '*');
      } else {
        addLog('error', '❌ Iframe contentWindow not available');
      }

    } catch (error: any) {
      addLog('error', `❌ Diagnostic error: ${error.message}`);
    }

    setDiagnostics(results);
  };

  useEffect(() => {
    if (iframeReady) {
      setTimeout(runDiagnostics, 500);
    }
  }, [iframeReady]);

  const levelColors = {
    info: 'bg-blue-500/10 text-blue-500',
    warn: 'bg-yellow-500/10 text-yellow-500',
    error: 'bg-red-500/10 text-red-500',
    success: 'bg-green-500/10 text-green-500'
  };

  const levelIcons = {
    info: AlertCircle,
    warn: AlertCircle,
    error: XCircle,
    success: CheckCircle2
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Bug className="w-4 h-4" />
          Debug Panel
        </CardTitle>
        <Button
          size="sm"
          variant="outline"
          onClick={runDiagnostics}
          data-testid="button-run-diagnostics"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Run
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Diagnostics Status */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">System Status</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              {diagnostics.iframeAccessible ? (
                <CheckCircle2 className="w-3 h-3 text-green-500" />
              ) : (
                <XCircle className="w-3 h-3 text-red-500" />
              )}
              <span>Iframe Access</span>
            </div>
            <div className="flex items-center gap-2">
              {diagnostics.scriptInjected ? (
                <CheckCircle2 className="w-3 h-3 text-green-500" />
              ) : (
                <XCircle className="w-3 h-3 text-red-500" />
              )}
              <span>Script Injected</span>
            </div>
            <div className="flex items-center gap-2">
              {diagnostics.postMessageWorks ? (
                <CheckCircle2 className="w-3 h-3 text-green-500" />
              ) : (
                <XCircle className="w-3 h-3 text-red-500" />
              )}
              <span>PostMessage</span>
            </div>
            <div className="flex items-center gap-2">
              {!diagnostics.crossOrigin ? (
                <CheckCircle2 className="w-3 h-3 text-green-500" />
              ) : (
                <AlertCircle className="w-3 h-3 text-yellow-500" />
              )}
              <span>Same Origin</span>
            </div>
          </div>
        </div>

        {/* Current Selection */}
        {selectedComponent && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Selected Element</h3>
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {selectedComponent.tagName}
                </Badge>
                {selectedComponent.element.getAttribute('data-testid') && (
                  <span className="text-muted-foreground">
                    #{selectedComponent.element.getAttribute('data-testid')}
                  </span>
                )}
              </div>
              <div className="text-muted-foreground">
                ID: {selectedComponent.id}
              </div>
            </div>
          </div>
        )}

        {/* Logs */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Logs ({logs.length})</h3>
          <ScrollArea className="h-[200px] w-full rounded-md border p-2">
            <div className="space-y-1">
              {logs.length === 0 ? (
                <p className="text-xs text-muted-foreground">No logs yet</p>
              ) : (
                logs.map((log, i) => {
                  const Icon = levelIcons[log.level];
                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-2 p-2 rounded text-xs ${levelColors[log.level]}`}
                    >
                      <Icon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-mono break-all">{log.message}</div>
                        <div className="text-[10px] opacity-70 mt-1">
                          {log.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
