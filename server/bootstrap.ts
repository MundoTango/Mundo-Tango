/**
 * BOOTSTRAP MODULE - Must be imported FIRST
 * 
 * This module keeps the event loop alive during ESM module loading.
 * Without this, async module-level code (like service initialization)
 * can cause the process to exit before the HTTP server starts.
 */

// Keep event loop alive during startup
const startupKeepalive = setInterval(() => {}, 100);
console.log('🔵 [BOOTSTRAP] Event loop keepalive registered');

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION:', err);
  console.error('Stack:', err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION at:', promise);
  console.error('Reason:', reason);
});

// Export function to clear keepalive once server is listening
export function clearStartupKeepalive() {
  clearInterval(startupKeepalive);
  console.log('🔵 [BOOTSTRAP] Startup keepalive cleared - server is running');
}
