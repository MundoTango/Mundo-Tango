import { test, expect } from '@playwright/test';

const breakpoints = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 }
];

const pages = [
  { name: 'landing', path: '/landing' },
  { name: 'feed', path: '/feed' },
  { name: 'events', path: '/events' },
  { name: 'pricing', path: '/pricing' },
  { name: 'groups', path: '/groups' }
];

test.describe('Mobile Responsiveness Audit', () => {
  for (const breakpoint of breakpoints) {
    for (const pageInfo of pages) {
      test(`Audit ${pageInfo.name} at ${breakpoint.name} (${breakpoint.width}px)`, async ({ page }) => {
        await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
        
        // Go to page
        await page.goto(pageInfo.path, { waitUntil: 'load', timeout: 30000 });
        
        // Wait a bit for any client-side animations or hydration
        await page.waitForTimeout(2000);

        // 1. Check for horizontal scrolling
        const { overflowX, scrollWidth, innerWidth } = await page.evaluate(() => {
          return {
            overflowX: document.documentElement.scrollWidth > window.innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth
          };
        });
        
        if (overflowX) {
          console.error(`[ISSUE] Horizontal scroll detected on ${pageInfo.name} at ${breakpoint.name} (${breakpoint.width}px). scrollWidth: ${scrollWidth}, innerWidth: ${innerWidth}`);
        }
        
        // 2. Capture a screenshot for visual inspection
        await page.screenshot({ 
          path: `test-results/audit-${pageInfo.name}-${breakpoint.name}.png`,
          fullPage: true 
        });

        // 3. Simple overlap/overflow check: check if any elements are outside the viewport
        const overflowingElements = await page.evaluate(() => {
          const elements = document.querySelectorAll('*');
          const results = [];
          const vWidth = window.innerWidth;
          
          for (const el of elements) {
            const rect = el.getBoundingClientRect();
            if (rect.right > vWidth + 1) { // +1 for subpixel rounding
              const style = window.getComputedStyle(el);
              if (style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0) {
                // SVG className can be an object
                const className = typeof el.className === 'string' ? el.className.substring(0, 50) : 'SVG/Complex';
                results.push({
                  tag: el.tagName,
                  className: className,
                  right: rect.right,
                  viewportWidth: vWidth
                });
                if (results.length >= 3) break;
              }
            }
          }
          return results;
        });

        if (overflowingElements.length > 0) {
          console.log(`[WARNING] Potential overflowing elements on ${pageInfo.name} (${breakpoint.name}):`, JSON.stringify(overflowingElements));
        }

        // 4. Touch target check (mobile only)
        if (breakpoint.name === 'mobile') {
          const smallTouchTargets = await page.evaluate(() => {
            const targets = document.querySelectorAll('button, a, input, select');
            const results = [];
            for (const target of targets) {
              const rect = target.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
                const className = typeof target.className === 'string' ? target.className.substring(0, 50) : 'Complex';
                results.push({
                  tag: target.tagName,
                  className: className,
                  width: rect.width,
                  height: rect.height
                });
                if (results.length >= 3) break;
              }
            }
            return results;
          });
          if (smallTouchTargets.length > 0) {
             console.log(`[INFO] Small touch targets found on ${pageInfo.name} (${breakpoint.name}):`, JSON.stringify(smallTouchTargets));
          }
        }

        // We report issues but don't fail immediately to collect all data
        // expect(overflowX).toBe(false);
      });
    }
  }
});