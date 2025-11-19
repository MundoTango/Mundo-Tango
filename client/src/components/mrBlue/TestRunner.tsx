import { useState } from 'react';
import { PlayCircle, Loader2, CheckCircle2, XCircle, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

interface TestResult {
  testName: string;
  status: 'running' | 'passed' | 'failed' | 'skipped';
  duration?: number;
  error?: string;
  screenshot?: string;
}

interface TestSuite {
  id: string;
  name: string;
  description: string;
  file: string;
  estimatedDuration: string;
}

const TEST_SUITES: TestSuite[] = [
  {
    id: 'complete-workflow',
    name: 'Complete Mr. Blue Workflow',
    description: 'Tests all 8 requirements: conversation, VibeCoding, page awareness, agents, audit, issues, healing, full workflow',
    file: 'tests/e2e/mr-blue-complete-workflow.spec.ts',
    estimatedDuration: '~5 min',
  },
  {
    id: 'registration-mrblue',
    name: 'Registration + Mr. Blue AI',
    description: 'Tests registration flow and Mr. Blue AI bug detection and fixes',
    file: 'tests/e2e/registration-visual-editor-mrblue.spec.ts',
    estimatedDuration: '~3 min',
  },
  {
    id: 'simple-chromium',
    name: 'Simple Chromium Validation',
    description: 'Basic Chromium browser tests (launch, navigation, JS execution)',
    file: 'tests/simple-chromium-test.spec.ts',
    estimatedDuration: '~1 min',
  },
];

export function TestRunner() {
  const [selectedSuite, setSelectedSuite] = useState<string>('');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState('');
  const [results, setResults] = useState<TestResult[]>([]);
  const [output, setOutput] = useState<string[]>([]);
  const [exitCode, setExitCode] = useState<number | null>(null);
  
  const runTest = async (suiteId: string) => {
    const suite = TEST_SUITES.find(s => s.id === suiteId);
    if (!suite) return;
    
    setRunning(true);
    setProgress(0);
    setResults([]);
    setOutput([]);
    setExitCode(null);
    
    try {
      // Connect to SSE endpoint for streaming test results
      const eventSource = new EventSource(`/api/tests/run?file=${encodeURIComponent(suite.file)}`);
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'output') {
            setOutput(prev => [...prev, data.line]);
          } else if (data.type === 'progress') {
            setProgress(data.progress || 0);
            setCurrentTest(data.currentTest || '');
          } else if (data.type === 'result') {
            setResults(prev => [...prev, data.result]);
          } else if (data.type === 'complete') {
            setProgress(100);
            setExitCode(data.exitCode);
            setRunning(false);
            eventSource.close();
          }
        } catch (error) {
          console.error('Failed to parse SSE data:', error);
        }
      };
      
      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        setRunning(false);
        eventSource.close();
      };
      
    } catch (error) {
      console.error('Failed to run test:', error);
      setRunning(false);
    }
  };
  
  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'passed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'skipped':
        return <span className="w-4 h-4 text-muted-foreground">⊘</span>;
    }
  };
  
  const exportResults = () => {
    const report = {
      suite: selectedSuite,
      timestamp: new Date().toISOString(),
      results,
      output,
      exitCode,
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-results-${selectedSuite}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const passedTests = results.filter(r => r.status === 'passed').length;
  const failedTests = results.filter(r => r.status === 'failed').length;
  const totalTests = results.length;
  
  return (
    <div className="space-y-4 p-4" data-testid="test-runner">
      {/* Test Suite Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Test Suite</label>
        <Select value={selectedSuite} onValueChange={setSelectedSuite} disabled={running}>
          <SelectTrigger data-testid="select-test-suite">
            <SelectValue placeholder="Choose a test suite..." />
          </SelectTrigger>
          <SelectContent>
            {TEST_SUITES.map((suite) => (
              <SelectItem key={suite.id} value={suite.id}>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <div>
                    <div className="font-medium">{suite.name}</div>
                    <div className="text-xs text-muted-foreground">{suite.estimatedDuration}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedSuite && (
          <p className="text-xs text-muted-foreground">
            {TEST_SUITES.find(s => s.id === selectedSuite)?.description}
          </p>
        )}
      </div>
      
      {/* Run Button */}
      <Button
        onClick={() => runTest(selectedSuite)}
        disabled={!selectedSuite || running}
        className="w-full"
        data-testid="button-run-test"
      >
        {running ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Running Tests...
          </>
        ) : (
          <>
            <PlayCircle className="w-4 h-4 mr-2" />
            Run Tests
          </>
        )}
      </Button>
      
      {/* Progress */}
      {(running || results.length > 0) && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" data-testid="test-progress" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground" data-testid="current-test">
              {currentTest || 'Initializing...'}
            </span>
            <span className="text-muted-foreground" data-testid="test-percentage">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      )}
      
      {/* Results Summary */}
      {results.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-muted rounded-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium" data-testid="passed-count">{passedTests} Passed</span>
          </div>
          {failedTests > 0 && (
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium text-destructive" data-testid="failed-count">
                {failedTests} Failed
              </span>
            </div>
          )}
          <div className="ml-auto">
            <Badge variant={exitCode === 0 ? 'default' : 'destructive'} data-testid="exit-code">
              Exit: {exitCode ?? '-'}
            </Badge>
          </div>
        </div>
      )}
      
      {/* Test Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Test Results</h3>
            <Button size="sm" variant="outline" onClick={exportResults} data-testid="button-export">
              <Download className="w-3 h-3 mr-2" />
              Export
            </Button>
          </div>
          
          <ScrollArea className="h-[200px] rounded-md border border-border">
            <div className="p-2 space-y-1">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 rounded-md hover-elevate"
                  data-testid={`test-result-${index}`}
                >
                  {getStatusIcon(result.status)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground truncate">
                      {result.testName}
                    </div>
                    {result.duration && (
                      <div className="text-xs text-muted-foreground">
                        {(result.duration / 1000).toFixed(1)}s
                      </div>
                    )}
                    {result.error && (
                      <div className="text-xs text-destructive mt-1 line-clamp-2">
                        {result.error}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
      
      {/* Console Output */}
      {output.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Console Output</h3>
          <ScrollArea className="h-[150px] rounded-md border border-border bg-black/5 dark:bg-white/5">
            <div className="p-2 font-mono text-xs">
              {output.map((line, index) => (
                <div key={index} className="text-foreground/80">
                  {line}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
