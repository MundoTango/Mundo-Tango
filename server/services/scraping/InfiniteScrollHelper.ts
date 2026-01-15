/**
 * INFINITE SCROLL HELPER
 * Handles infinite scroll loading for all scrapers
 * MB.MD Pattern: Load all dynamic content from SPAs and infinite scroll sites
 */

type Page = import('playwright').Page;

export interface ScrollOptions {
  maxScrolls?: number;
  delayMs?: number;
  heightThreshold?: number;
}

export class InfiniteScrollHelper {
  /**
   * Perform infinite scroll and collect all loaded content
   * Returns the number of scroll attempts needed to reach end
   */
  static async scrollUntilEnd(
    page: Page,
    options: ScrollOptions = {}
  ): Promise<number> {
    const { maxScrolls = 20, delayMs = 800, heightThreshold = 100 } = options;

    let previousHeight = 0;
    let scrollAttempts = 0;

    while (scrollAttempts < maxScrolls) {
      // Get current page height
      const currentHeight = await page.evaluate(
        (threshold) => {
          const bodyHeight = document.body.scrollHeight;
          const htmlHeight = document.documentElement.scrollHeight;
          return Math.max(bodyHeight, htmlHeight);
        },
        heightThreshold
      );

      // Check if we've stopped growing
      if (currentHeight - previousHeight <= heightThreshold) {
        console.log(`[InfiniteScroll] ✅ Reached end (attempts: ${scrollAttempts})`);
        break;
      }

      // Scroll down
      await page.evaluate(
        (height) => window.scrollBy(0, height * 2),
        (currentHeight / 10) || 500 // Scroll by ~2 viewport heights
      );

      // Wait for content to load
      await page.waitForTimeout(delayMs);

      previousHeight = currentHeight;
      scrollAttempts++;

      console.log(`[InfiniteScroll] 📜 Scroll ${scrollAttempts}/${maxScrolls}: height=${currentHeight}px`);
    }

    return scrollAttempts;
  }

  /**
   * Extract all loaded content after scrolling
   */
  static async getLoadedContent(page: Page, selector: string): Promise<any[]> {
    return await page.evaluate((sel) => {
      const elements = Array.from(document.querySelectorAll(sel));
      return elements.map((el) => ({
        text: el.textContent,
        html: el.outerHTML,
        className: el.className,
        id: el.id
      }));
    }, selector);
  }
}
