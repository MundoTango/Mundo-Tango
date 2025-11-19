import { Router } from 'express';
import { spawn } from 'child_process';
import path from 'path';

const router = Router();

/**
 * Test Runner API - Runs Playwright tests programmatically
 * Streams results via Server-Sent Events (SSE)
 * MB.MD Protocol v9.2: Run tests INSIDE MT, not just CLI
 */

router.get('/run', async (req, res) => {
  const testFile = req.query.file as string;
  
  if (!testFile) {
    return res.status(400).json({ error: 'Test file parameter is required' });
  }
  
  // Security: Validate test file path
  if (!testFile.startsWith('tests/') && !testFile.startsWith('./tests/')) {
    return res.status(400).json({ error: 'Invalid test file path. Must be in tests/ directory' });
  }
  
  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
  
  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Test runner connected' })}\n\n`);
  
  try {
    // Run Playwright test
    const testProcess = spawn('npx', ['playwright', 'test', testFile, '--reporter=list'], {
      cwd: process.cwd(),
      env: { ...process.env },
    });
    
    let output = '';
    let currentTest = '';
    let progress = 0;
    let totalTests = 0;
    let completedTests = 0;
    
    // Handle stdout (test output)
    testProcess.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      
      lines.forEach((line: string) => {
        if (!line.trim()) return;
        
        // Send raw output
        res.write(`data: ${JSON.stringify({ type: 'output', line })}\n\n`);
        
        // Parse test progress
        if (line.includes('Running') && line.includes('tests using')) {
          const match = line.match(/Running (\d+) tests/);
          if (match) {
            totalTests = parseInt(match[1], 10);
          }
        }
        
        // Parse current test
        if (line.includes('›')) {
          const testMatch = line.match(/› (.+)/);
          if (testMatch) {
            currentTest = testMatch[1].trim();
            completedTests++;
            progress = totalTests > 0 ? (completedTests / totalTests) * 100 : 0;
            
            res.write(`data: ${JSON.stringify({
              type: 'progress',
              progress,
              currentTest,
              completedTests,
              totalTests,
            })}\n\n`);
          }
        }
        
        // Parse test results
        if (line.includes('✓') || line.includes('✘')) {
          const isPassed = line.includes('✓');
          const testName = line.replace(/[✓✘]\s+\d+\s+/, '').trim();
          
          res.write(`data: ${JSON.stringify({
            type: 'result',
            result: {
              testName,
              status: isPassed ? 'passed' : 'failed',
              duration: null,
            },
          })}\n\n`);
        }
        
        output += line + '\n';
      });
    });
    
    // Handle stderr (errors)
    testProcess.stderr.on('data', (data) => {
      const error = data.toString();
      res.write(`data: ${JSON.stringify({ type: 'error', error })}\n\n`);
      output += error + '\n';
    });
    
    // Handle process completion
    testProcess.on('close', (code) => {
      res.write(`data: ${JSON.stringify({
        type: 'complete',
        exitCode: code,
        output,
        success: code === 0,
      })}\n\n`);
      
      // End SSE connection
      res.end();
    });
    
    // Handle client disconnect
    req.on('close', () => {
      testProcess.kill();
    });
    
  } catch (error) {
    console.error('Test runner error:', error);
    res.write(`data: ${JSON.stringify({
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    })}\n\n`);
    res.end();
  }
});

/**
 * List available test suites
 */
router.get('/suites', async (req, res) => {
  const suites = [
    {
      id: 'complete-workflow',
      name: 'Complete Mr. Blue Workflow',
      description: 'Tests all 8 requirements',
      file: 'tests/e2e/mr-blue-complete-workflow.spec.ts',
      estimatedDuration: '~5 min',
    },
    {
      id: 'registration-mrblue',
      name: 'Registration + Mr. Blue AI',
      description: 'Tests registration and AI bug fixes',
      file: 'tests/e2e/registration-visual-editor-mrblue.spec.ts',
      estimatedDuration: '~3 min',
    },
    {
      id: 'simple-chromium',
      name: 'Simple Chromium Validation',
      description: 'Basic browser tests',
      file: 'tests/simple-chromium-test.spec.ts',
      estimatedDuration: '~1 min',
    },
  ];
  
  res.json({ success: true, suites });
});

export default router;
