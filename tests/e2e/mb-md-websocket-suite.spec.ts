import { test, expect } from '@playwright/test';
import { BugReporter } from './helpers/bug-reporter';

const SUITE_NAME = 'WebSocket Tests';
const TEST_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@mundotango.life';
const TEST_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'admin123';

test.describe(SUITE_NAME, () => {
  let bugReporter: BugReporter;

  test.beforeEach(async ({ page }) => {
    bugReporter = new BugReporter(page);
    await page.goto('/login');
    await page.fill('[data-testid="input-email"]', TEST_EMAIL);
    await page.fill('[data-testid="input-password"]', TEST_PASSWORD);
    await page.click('[data-testid="button-login"]');
    await page.waitForURL(/\/feed|\/dashboard/, { timeout: 10000 });
  });

  test('WS-01: WebSocket connects within 2 seconds of login', async ({ page }, testInfo) => {
    try {
      const wsConnected = await page.evaluate(() => {
        return new Promise((resolve) => {
          const checkConnection = () => {
            const wsStatus = (window as any).wsConnected;
            if (wsStatus === true) {
              resolve(true);
            }
          };
          
          const timeout = setTimeout(() => resolve(false), 2000);
          
          const interval = setInterval(checkConnection, 100);
          
          Promise.race([
            new Promise(res => setTimeout(res, 2000)),
            new Promise(res => {
              checkConnection();
              const check = setInterval(() => {
                if ((window as any).wsConnected) {
                  clearInterval(check);
                  clearInterval(interval);
                  clearTimeout(timeout);
                  res(true);
                }
              }, 100);
            })
          ]).then(resolve);
        });
      });
      
      expect(wsConnected).toBeTruthy();
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'WebSocket connects within 2 seconds',
        1,
        String(error),
        {
          files: ['client/src/lib/websocket.ts', 'server/index.ts'],
          issue: 'WebSocket not connecting within 2 seconds of login',
          expectedFix: 'Initialize WebSocket connection on authentication',
          priority: 'critical',
        },
        testInfo
      );
      throw error;
    }
  });

  test('WS-02: Zero WebSocket errors in console after connection', async ({ page }, testInfo) => {
    try {
      await page.waitForTimeout(3000);
      
      const wsErrors = bugReporter.getWebSocketErrors();
      expect(wsErrors.length).toBe(0);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Zero WebSocket errors',
        2,
        String(error),
        {
          files: ['client/src/lib/websocket.ts', 'server/websocket.ts'],
          issue: 'WebSocket connection producing errors',
          expectedFix: 'Fix WebSocket connection and error handling',
          priority: 'high',
        },
        testInfo
      );
      throw error;
    }
  });

  test('WS-03: WebSocket reconnects after page refresh', async ({ page }, testInfo) => {
    try {
      await page.waitForTimeout(2000);
      
      bugReporter.clearLogs();
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      await page.waitForTimeout(3000);
      
      const wsErrors = bugReporter.getWebSocketErrors();
      expect(wsErrors.length).toBe(0);
      
      const wsConnected = await page.evaluate(() => (window as any).wsConnected);
      expect(wsConnected).toBeTruthy();
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'WebSocket reconnects after refresh',
        3,
        String(error),
        {
          files: ['client/src/lib/websocket.ts'],
          issue: 'WebSocket not reconnecting after page refresh',
          expectedFix: 'Implement automatic reconnection on page load',
          priority: 'high',
        },
        testInfo
      );
      throw error;
    }
  });

  test('WS-04: WebSocket reconnects 10 times successfully', async ({ page }, testInfo) => {
    try {
      for (let i = 0; i < 10; i++) {
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        const wsConnected = await page.evaluate(() => (window as any).wsConnected);
        expect(wsConnected).toBeTruthy();
      }
      
      const wsErrors = bugReporter.getWebSocketErrors();
      expect(wsErrors.length).toBe(0);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'WebSocket reconnects 10 times',
        4,
        String(error),
        {
          files: ['client/src/lib/websocket.ts'],
          issue: 'WebSocket failing to reconnect consistently',
          expectedFix: 'Improve reconnection logic with exponential backoff',
          priority: 'medium',
        },
        testInfo
      );
      throw error;
    }
  });

  test('WS-05: Connection status displayed correctly in UI', async ({ page }, testInfo) => {
    try {
      await page.waitForTimeout(2000);
      
      const statusIndicator = page.locator('[data-testid="status-websocket"]');
      await expect(statusIndicator).toBeVisible({ timeout: 5000 });
      
      const statusText = await statusIndicator.textContent();
      expect(statusText?.toLowerCase()).toContain('connected');
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Connection status displayed in UI',
        5,
        String(error),
        {
          files: ['client/src/components/ConnectionStatusBadge.tsx'],
          issue: 'WebSocket connection status not shown in UI',
          expectedFix: 'Add connection status indicator component',
          priority: 'medium',
        },
        testInfo
      );
      throw error;
    }
  });

  test('WS-06: Heartbeat/ping-pong keeps connection alive', async ({ page }, testInfo) => {
    try {
      await page.waitForTimeout(2000);
      
      const initialConnected = await page.evaluate(() => (window as any).wsConnected);
      expect(initialConnected).toBeTruthy();
      
      await page.waitForTimeout(30000);
      
      const stillConnected = await page.evaluate(() => (window as any).wsConnected);
      expect(stillConnected).toBeTruthy();
      
      const wsErrors = bugReporter.getWebSocketErrors();
      expect(wsErrors.length).toBe(0);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Heartbeat keeps connection alive',
        6,
        String(error),
        {
          files: ['client/src/lib/websocket.ts', 'server/websocket.ts'],
          issue: 'WebSocket connection timing out',
          expectedFix: 'Implement ping/pong heartbeat mechanism',
          priority: 'high',
        },
        testInfo
      );
      throw error;
    }
  });

  test('WS-07: Real-time message received through WebSocket', async ({ page }, testInfo) => {
    try {
      await page.waitForTimeout(2000);
      
      let messageReceived = false;
      page.on('console', (msg) => {
        if (msg.text().includes('WebSocket message') || msg.text().includes('ws:message')) {
          messageReceived = true;
        }
      });
      
      await page.evaluate(() => {
        const ws = (window as any).ws;
        if (ws && ws.send) {
          ws.send(JSON.stringify({ type: 'test', data: 'ping' }));
        }
      });
      
      await page.waitForTimeout(2000);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Real-time message received',
        7,
        String(error),
        {
          files: ['client/src/lib/websocket.ts', 'server/websocket.ts'],
          issue: 'WebSocket messages not being received',
          expectedFix: 'Implement message handlers for WebSocket events',
          priority: 'high',
        },
        testInfo
      );
      throw error;
    }
  });

  test('WS-08: WebSocket URL uses correct protocol (wss/ws)', async ({ page }, testInfo) => {
    try {
      const wsUrl = await page.evaluate(() => {
        const ws = (window as any).ws;
        return ws ? ws.url : null;
      });
      
      expect(wsUrl).toBeTruthy();
      expect(wsUrl).toMatch(/^wss?:\/\//);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'WebSocket uses correct protocol',
        8,
        String(error),
        {
          files: ['client/src/lib/websocket.ts'],
          issue: 'WebSocket URL malformed or using wrong protocol',
          expectedFix: 'Use wss:// for HTTPS and ws:// for HTTP',
          priority: 'medium',
        },
        testInfo
      );
      throw error;
    }
  });

  test('WS-09: Disconnection shows proper UI feedback', async ({ page }, testInfo) => {
    try {
      await page.waitForTimeout(2000);
      
      await page.evaluate(() => {
        const ws = (window as any).ws;
        if (ws && ws.close) {
          ws.close();
        }
      });
      
      await page.waitForTimeout(1000);
      
      const statusIndicator = page.locator('[data-testid="status-websocket"]');
      const statusText = await statusIndicator.textContent();
      expect(statusText?.toLowerCase()).toContain('disconnected');
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Disconnection shows UI feedback',
        9,
        String(error),
        {
          files: ['client/src/components/ConnectionStatusBadge.tsx'],
          issue: 'Disconnection state not reflected in UI',
          expectedFix: 'Update status indicator on WebSocket close event',
          priority: 'low',
        },
        testInfo
      );
      throw error;
    }
  });

  test('WS-10: Automatic reconnection after network failure', async ({ page }, testInfo) => {
    try {
      await page.waitForTimeout(2000);
      
      await page.evaluate(() => {
        const ws = (window as any).ws;
        if (ws && ws.close) {
          ws.close();
        }
      });
      
      await page.waitForTimeout(5000);
      
      const reconnected = await page.evaluate(() => (window as any).wsConnected);
      expect(reconnected).toBeTruthy();
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Automatic reconnection after failure',
        10,
        String(error),
        {
          files: ['client/src/lib/websocket.ts'],
          issue: 'WebSocket not reconnecting automatically',
          expectedFix: 'Implement reconnection strategy with backoff',
          priority: 'high',
        },
        testInfo
      );
      throw error;
    }
  });

  test('WS-11: Multiple WebSocket messages handled correctly', async ({ page }, testInfo) => {
    try {
      await page.waitForTimeout(2000);
      
      const messagesReceived = await page.evaluate(() => {
        return new Promise((resolve) => {
          const messages: any[] = [];
          const ws = (window as any).ws;
          
          if (ws) {
            const originalOnMessage = ws.onmessage;
            ws.onmessage = (event: any) => {
              messages.push(event.data);
              if (originalOnMessage) originalOnMessage(event);
            };
            
            for (let i = 0; i < 5; i++) {
              ws.send(JSON.stringify({ type: 'test', id: i }));
            }
            
            setTimeout(() => resolve(messages.length >= 3), 3000);
          } else {
            resolve(false);
          }
        });
      });
      
      expect(messagesReceived).toBeTruthy();
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'Multiple messages handled',
        11,
        String(error),
        {
          files: ['client/src/lib/websocket.ts', 'server/websocket.ts'],
          issue: 'Multiple WebSocket messages not being processed',
          expectedFix: 'Ensure message queue handles concurrent messages',
          priority: 'medium',
        },
        testInfo
      );
      throw error;
    }
  });

  test('WS-12: WebSocket connection includes authentication token', async ({ page }, testInfo) => {
    try {
      const wsUrl = await page.evaluate(() => {
        const ws = (window as any).ws;
        return ws ? ws.url : null;
      });
      
      expect(wsUrl).toBeTruthy();
      expect(wsUrl).toMatch(/token=/);
    } catch (error) {
      await bugReporter.createBugReport(
        SUITE_NAME,
        'WebSocket includes auth token',
        12,
        String(error),
        {
          files: ['client/src/lib/websocket.ts', 'server/websocket.ts'],
          issue: 'WebSocket connection not authenticated',
          expectedFix: 'Add token to WebSocket connection URL or headers',
          priority: 'critical',
        },
        testInfo
      );
      throw error;
    }
  });
});
