import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getErrorDetector } from "@/lib/proactiveErrorDetection";
import { AlertCircle, Bug, Zap, Shield, Activity } from "lucide-react";

/**
 * ERROR DETECTION TEST PAGE
 * Manual testing page for ProactiveErrorDetector
 * 
 * Tests:
 * 1. console.error interception
 * 2. console.warn interception
 * 3. Unhandled errors
 * 4. Unhandled promise rejections
 * 5. Rate limiting (10 errors/minute)
 * 6. Batch sending (every 10 seconds)
 */
export default function ErrorDetectionTest() {
  const [stats, setStats] = useState<any>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  const updateStats = () => {
    const detector = getErrorDetector();
    const currentStats = detector.getStats();
    setStats(currentStats);
  };

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    updateStats();
  };

  const testConsoleError = () => {
    console.error("TEST: This is a test console.error");
    addResult("✅ Triggered console.error");
  };

  const testConsoleWarn = () => {
    console.warn("TEST: This is a test console.warn");
    addResult("✅ Triggered console.warn");
  };

  const testUnhandledError = () => {
    setTimeout(() => {
      throw new Error("TEST: Unhandled error from setTimeout");
    }, 100);
    addResult("✅ Triggered unhandled error");
  };

  const testUnhandledRejection = () => {
    Promise.reject(new Error("TEST: Unhandled promise rejection"));
    addResult("✅ Triggered unhandled promise rejection");
  };

  const testRateLimiting = () => {
    // Trigger 20 errors rapidly - only 10 should be captured
    for (let i = 0; i < 20; i++) {
      console.error(`TEST: Rate limit test error ${i + 1}/20`);
    }
    addResult("✅ Triggered 20 rapid errors (rate limit test)");
  };

  const testBatchSending = () => {
    const detector = getErrorDetector();
    detector.flushBatch();
    addResult("✅ Manually flushed batch to API");
  };

  const clearResults = () => {
    setTestResults([]);
    updateStats();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Bug className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Error Detection Test Page</h1>
          <p className="text-muted-foreground">
            Test the ProactiveErrorDetector system
          </p>
        </div>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Error Detector Stats
          </CardTitle>
          <CardDescription>
            Real-time statistics from the error detector
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{stats?.totalErrors || 0}</div>
              <div className="text-sm text-muted-foreground">Total Errors</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{stats?.queuedErrors || 0}</div>
              <div className="text-sm text-muted-foreground">Queued</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{stats?.recentErrors || 0}</div>
              <div className="text-sm text-muted-foreground">Recent (1 min)</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{stats?.rateLimitRemaining || 10}</div>
              <div className="text-sm text-muted-foreground">Limit Remaining</div>
            </div>
          </div>
          <Button onClick={updateStats} variant="outline" className="mt-4" size="sm">
            Refresh Stats
          </Button>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Error Triggers
          </CardTitle>
          <CardDescription>
            Manually trigger different types of errors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={testConsoleError} variant="outline" className="justify-start">
              <Bug className="h-4 w-4 mr-2" />
              Trigger console.error
            </Button>
            
            <Button onClick={testConsoleWarn} variant="outline" className="justify-start">
              <AlertCircle className="h-4 w-4 mr-2" />
              Trigger console.warn
            </Button>
            
            <Button onClick={testUnhandledError} variant="outline" className="justify-start">
              <Zap className="h-4 w-4 mr-2" />
              Trigger Unhandled Error
            </Button>
            
            <Button onClick={testUnhandledRejection} variant="outline" className="justify-start">
              <Shield className="h-4 w-4 mr-2" />
              Trigger Promise Rejection
            </Button>
          </div>

          <div className="border-t pt-4 space-y-3">
            <h3 className="font-semibold">Advanced Tests</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={testRateLimiting} variant="secondary">
                Test Rate Limiting (20 errors)
              </Button>
              
              <Button onClick={testBatchSending} variant="secondary">
                Force Batch Send Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Test Results
            </div>
            <Button onClick={clearResults} variant="ghost" size="sm">
              Clear
            </Button>
          </CardTitle>
          <CardDescription>
            Log of test actions and results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No tests run yet. Click a button above to start testing.
              </p>
            ) : (
              testResults.map((result, i) => (
                <div key={i} className="p-3 bg-muted rounded-md text-sm font-mono">
                  {result}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="font-semibold">Expected Behavior:</h4>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>All errors should be captured and queued</li>
              <li>Max 10 errors per minute (rate limiting)</li>
              <li>Errors batched and sent every 10 seconds</li>
              <li>404 responses from API are OK (Phase 2 - endpoint not ready yet)</li>
              <li>No infinite loops - check browser console for [ProactiveErrorDetector] logs</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">To Verify:</h4>
            <ol className="list-decimal pl-6 space-y-1 text-sm">
              <li>Open browser console (F12)</li>
              <li>Look for "[ProactiveErrorDetector]" initialization message</li>
              <li>Trigger a test error above</li>
              <li>Verify error is logged with "[ProactiveErrorDetector] Captured..." message</li>
              <li>Wait 10 seconds - verify batch is sent to /api/mrblue/analyze-error</li>
              <li>Check for graceful 404 handling (expected during Phase 2)</li>
            </ol>
          </div>

          <Badge variant="outline" className="mt-4">
            ℹ️ Check browser console for detailed logs
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
