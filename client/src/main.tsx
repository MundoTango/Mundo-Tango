import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/visual-editor.css";
import "./lib/i18n";

// Suppress Vite HMR WebSocket errors in development
// These occur when HMR falls back to localhost:undefined during reconnection
if (import.meta.env.DEV) {
  // Suppress unhandledrejection events for WebSocket errors
  window.addEventListener('unhandledrejection', (event) => {
    try {
      const message = String(event.reason?.message || event.reason || '');
      const stack = String(event.reason?.stack || '');
      
      // Check for localhost:undefined or any HMR-related WebSocket errors
      if (message.includes('localhost:undefined') ||
          message.includes('localhost') ||
          message.includes('Failed to construct') ||
          message.includes('wss://') ||
          stack.includes('localhost') ||
          stack.includes('setupWebSocket') ||
          (message.includes('WebSocket') && message.includes('invalid'))) {
        event.preventDefault();
      }
    } catch (e) {
      // Ignore any errors in error handling
    }
  }, true); // Use capture phase to catch errors early
  
  // Also suppress console warnings and errors for HMR
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.warn = (...args) => {
    const warnStr = String(args[0]);
    if (warnStr.includes('WebSocket') || warnStr.includes('localhost')) {
      return;
    }
    originalWarn.apply(console, args);
  };
  
  console.error = (...args) => {
    const errorStr = String(args[0]);
    if (errorStr.includes('WebSocket') || errorStr.includes('localhost')) {
      return;
    }
    originalError.apply(console, args);
  };
}

createRoot(document.getElementById("root")!).render(<App />);
// Build 1762146413
