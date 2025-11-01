/**
 * Avatar Configuration
 * Controls whether to use 2D Canvas or 3D WebGL avatar
 */

export const AVATAR_CONFIG = {
  // Set to 'auto' to use 3D if model available, fallback to 2D
  // Set to '3d' to force 3D (with placeholder if model not ready)
  // Set to '2d' to force 2D canvas
  mode: 'auto' as '2d' | '3d' | 'auto',
  
  // Enable this to show both 2D and 3D side-by-side for testing
  debug: false,
  
  // 3D model settings
  model: {
    autoCheck: true, // Automatically check if 3D model is available
    checkInterval: 30000, // Check every 30 seconds
    usePlaceholder: true, // Use 3D placeholder while model generates
  },
  
  // Fallback behavior
  fallback: {
    use2DOnError: true, // Fall back to 2D if 3D fails to render
    showErrorMessage: false, // Don't show error messages to users
  }
};

export function shouldUse3D(modelAvailable: boolean): boolean {
  if (AVATAR_CONFIG.mode === '2d') return false;
  if (AVATAR_CONFIG.mode === '3d') return true;
  // 'auto' mode
  return modelAvailable || AVATAR_CONFIG.model.usePlaceholder;
}
