import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/visual-editor.css";
import "./lib/i18n";

// Suppress Vite HMR WebSocket errors in development
// These occur when HMR falls back to localhost:undefined during reconnection
if (import.meta.env.DEV) {
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || String(event.reason);
    if (message.includes('localhost:undefined') ||
        message.includes('Failed to construct \'WebSocket\'') ||
        message.includes('wss://localhost:undefined')) {
      event.preventDefault();
      console.debug('[Vite HMR] Suppressed development WebSocket error');
    }
  });
  
  // Also catch errors in console to prevent them from showing
  const originalError = console.error;
  console.error = (...args) => {
    const errorStr = String(args[0]);
    if (errorStr.includes('WebSocket') && errorStr.includes('localhost:undefined')) {
      console.debug('[Vite HMR] Suppressed', errorStr);
      return;
    }
    originalError.apply(console, args);
  };
}

createRoot(document.getElementById("root")!).render(<App />);
// Build 1762146413
