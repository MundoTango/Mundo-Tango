import { test } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

const BASE_URL =
  process.env.BASE_URL ||
  "https://e0001089-5956-480e-9ebc-7b1a6c2ec0e7-00-3cydblgjeyjzl.worf.replit.dev";
const VIDEOS_DIR = path.join(process.cwd(), "marketing-assets/videos");

// Ensure video directory exists
if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

test("Record Comprehensive Platform Flyover Video", async ({ browser }) => {
  console.log(
    "🎬 Starting comprehensive video recording for Mundo Tango platform",
  );

  // Create context with video recording
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: VIDEOS_DIR,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();

  try {
    // Helper function for smooth scrolling
    const smoothScroll = async (
      scrollPositions: number[],
      delayMs: number = 1000,
    ) => {
      for (const position of scrollPositions) {
        await page.evaluate(
          (pos) => window.scrollTo({ top: pos, behavior: "smooth" }),
          position,
        );
        await page.waitForTimeout(delayMs);
      }
    };

    // 1. LANDING PAGE
    console.log("📍 1/5: Recording Landing Page...");
    await page.goto(`${BASE_URL}/feed`, {
      waitUntil: "load",
      timeout: 90000,
    });
    await page.waitForTimeout(1000);

    // Scroll through landing page sections
    await smoothScroll([600, 1200, 1800, 2400, 0], 2500);
    await page.waitForTimeout(1000);

    // 2. EVENTS PAGE
    console.log("📍 2/5: Recording Events Page...");
    await page.goto(`${BASE_URL}/events`, {
      waitUntil: "load",
      timeout: 90000,
    });
    await page.waitForTimeout(1000);

    // Scroll through events
    await smoothScroll([500, 1000, 1500, 0], 2500);
    await page.waitForTimeout(1000);

    // 3. HOUSING PAGE
    console.log("📍 3/5: Recording Housing Page...");
    await page.goto(`${BASE_URL}/housing`, {
      waitUntil: "load",
      timeout: 90000,
    });
    await page.waitForTimeout(1000);

    // Scroll through housing listings
    await smoothScroll([500, 1000, 1500, 0], 2500);
    await page.waitForTimeout(1000);

    // 4. GROUPS PAGE
    console.log("📍 4/5: Recording Groups/Communities Page...");
    await page.goto(`${BASE_URL}/groups`, {
      waitUntil: "load",
      timeout: 90000,
    });
    await page.waitForTimeout(1000);

    // Scroll through groups
    await smoothScroll([500, 1000, 1500, 0], 2500);
    await page.waitForTimeout(1000);

    // 5. NETWORK PAGE
    console.log("📍 5/5: Recording Network/People Page...");
    await page.goto(`${BASE_URL}/network`, {
      waitUntil: "load",
      timeout: 90000,
    });
    await page.waitForTimeout(1000);

    // Scroll through network
    await smoothScroll([500, 1000, 1500, 0], 2500);
    await page.waitForTimeout(1000);

    // Return to landing for nice ending
    console.log("📍 Finale: Returning to Landing Page...");
    await page.goto(`${BASE_URL}/feed`, {
      waitUntil: "load",
      timeout: 90000,
    });
    await page.waitForTimeout(1000);

    console.log("✅ Comprehensive platform flyover recording complete!");
  } catch (error) {
    console.error("❌ Error during recording:", error);
  } finally {
    // Close context to save video
    await context.close();
    console.log(`💾 Video saved to: ${VIDEOS_DIR}`);
  }
});
