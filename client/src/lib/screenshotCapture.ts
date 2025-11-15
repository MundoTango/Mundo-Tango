/**
 * Screenshot Capture Service for Visual Editor
 * Uses html2canvas to capture iframe screenshots and stores them in IndexedDB via localforage
 */

import html2canvas from 'html2canvas';
import localforage from 'localforage';

const screenshotStore = localforage.createInstance({
  name: 'visual-editor-screenshots',
  driver: localforage.INDEXEDDB,
  description: 'Visual Editor change history screenshots'
});

const MAX_SCREENSHOTS = 50;

export interface ScreenshotMetadata {
  id: string;
  timestamp: number;
  prompt: string;
  type: 'before' | 'after';
  changeId: string;
}

/**
 * Capture screenshot from iframe using html2canvas
 * @param iframe - The iframe element to capture
 * @returns Base64 encoded PNG image data URL
 */
export async function captureIframeScreenshot(iframe: HTMLIFrameElement): Promise<string> {
  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (!iframeDoc) {
      throw new Error('Cannot access iframe document');
    }

    if (!iframeDoc.body) {
      throw new Error('Iframe body not found');
    }

    // Wait a bit for any pending renders
    await new Promise(resolve => setTimeout(resolve, 100));

    // Capture the iframe content
    const canvas = await html2canvas(iframeDoc.body, {
      allowTaint: true,
      useCORS: true,
      scale: 0.5, // Reduce file size while maintaining readability
      logging: false, // Disable console logging
      backgroundColor: '#ffffff',
      windowWidth: iframeDoc.body.scrollWidth,
      windowHeight: iframeDoc.body.scrollHeight,
    });

    // Convert to base64 PNG
    const dataUrl = canvas.toDataURL('image/png', 0.8);
    
    console.log('[ScreenshotCapture] Screenshot captured:', {
      width: canvas.width,
      height: canvas.height,
      size: Math.round(dataUrl.length / 1024) + 'KB'
    });

    return dataUrl;
  } catch (error) {
    console.error('[ScreenshotCapture] Failed to capture screenshot:', error);
    throw error;
  }
}

/**
 * Save screenshot to IndexedDB
 * @param id - Unique identifier for the screenshot
 * @param dataUrl - Base64 encoded image data
 * @param metadata - Optional metadata about the screenshot
 */
export async function saveScreenshot(
  id: string, 
  dataUrl: string,
  metadata?: Partial<ScreenshotMetadata>
): Promise<void> {
  try {
    const data = {
      dataUrl,
      metadata: {
        id,
        timestamp: Date.now(),
        ...metadata
      }
    };

    await screenshotStore.setItem(id, data);
    console.log('[ScreenshotCapture] Screenshot saved:', id);

    // Auto-cleanup: Keep only last MAX_SCREENSHOTS
    await cleanupOldScreenshots();
  } catch (error) {
    console.error('[ScreenshotCapture] Failed to save screenshot:', error);
    throw error;
  }
}

/**
 * Retrieve screenshot from IndexedDB
 * @param id - Screenshot identifier
 * @returns Base64 encoded image data URL or null if not found
 */
export async function getScreenshot(id: string): Promise<string | null> {
  try {
    const data = await screenshotStore.getItem<any>(id);
    return data?.dataUrl || null;
  } catch (error) {
    console.error('[ScreenshotCapture] Failed to get screenshot:', error);
    return null;
  }
}

/**
 * Get screenshot with metadata
 * @param id - Screenshot identifier
 * @returns Screenshot data with metadata or null
 */
export async function getScreenshotWithMetadata(id: string): Promise<{
  dataUrl: string;
  metadata: ScreenshotMetadata;
} | null> {
  try {
    const data = await screenshotStore.getItem<any>(id);
    return data || null;
  } catch (error) {
    console.error('[ScreenshotCapture] Failed to get screenshot with metadata:', error);
    return null;
  }
}

/**
 * Remove old screenshots to maintain MAX_SCREENSHOTS limit
 */
async function cleanupOldScreenshots(): Promise<void> {
  try {
    const keys = await screenshotStore.keys();
    
    if (keys.length <= MAX_SCREENSHOTS) {
      return;
    }

    // Get all screenshots with timestamps
    const screenshots = await Promise.all(
      keys.map(async (key) => {
        const data = await screenshotStore.getItem<any>(key);
        return {
          key,
          timestamp: data?.metadata?.timestamp || 0
        };
      })
    );

    // Sort by timestamp (oldest first)
    screenshots.sort((a, b) => a.timestamp - b.timestamp);

    // Remove oldest screenshots
    const toRemove = screenshots.slice(0, keys.length - MAX_SCREENSHOTS);
    await Promise.all(toRemove.map(item => screenshotStore.removeItem(item.key)));

    console.log(`[ScreenshotCapture] Cleaned up ${toRemove.length} old screenshots`);
  } catch (error) {
    console.error('[ScreenshotCapture] Failed to cleanup screenshots:', error);
  }
}

/**
 * Get all screenshot keys sorted by timestamp (newest first)
 */
export async function getAllScreenshotKeys(): Promise<string[]> {
  try {
    const keys = await screenshotStore.keys();
    
    // Get timestamps for sorting
    const keysWithTimestamps = await Promise.all(
      keys.map(async (key) => {
        const data = await screenshotStore.getItem<any>(key);
        return {
          key,
          timestamp: data?.metadata?.timestamp || 0
        };
      })
    );

    // Sort by timestamp (newest first)
    keysWithTimestamps.sort((a, b) => b.timestamp - a.timestamp);

    return keysWithTimestamps.map(item => item.key);
  } catch (error) {
    console.error('[ScreenshotCapture] Failed to get screenshot keys:', error);
    return [];
  }
}

/**
 * Delete a specific screenshot
 */
export async function deleteScreenshot(id: string): Promise<void> {
  try {
    await screenshotStore.removeItem(id);
    console.log('[ScreenshotCapture] Screenshot deleted:', id);
  } catch (error) {
    console.error('[ScreenshotCapture] Failed to delete screenshot:', error);
    throw error;
  }
}

/**
 * Clear all screenshots
 */
export async function clearAllScreenshots(): Promise<void> {
  try {
    await screenshotStore.clear();
    console.log('[ScreenshotCapture] All screenshots cleared');
  } catch (error) {
    console.error('[ScreenshotCapture] Failed to clear screenshots:', error);
    throw error;
  }
}

/**
 * Get storage usage statistics
 */
export async function getStorageStats(): Promise<{
  count: number;
  estimatedSize: string;
}> {
  try {
    const keys = await screenshotStore.keys();
    
    // Estimate size (rough calculation)
    let totalSize = 0;
    for (const key of keys) {
      const data = await screenshotStore.getItem<any>(key);
      if (data?.dataUrl) {
        totalSize += data.dataUrl.length;
      }
    }

    const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);

    return {
      count: keys.length,
      estimatedSize: `${sizeInMB} MB`
    };
  } catch (error) {
    console.error('[ScreenshotCapture] Failed to get storage stats:', error);
    return { count: 0, estimatedSize: '0 MB' };
  }
}
