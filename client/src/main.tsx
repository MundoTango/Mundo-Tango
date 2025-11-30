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
    const message = event.reason?.message || String(event.reason);
    const stack = event.reason?.stack || String(event.reason);
    
    // Check for localhost:undefined WebSocket errors
    if ((message.includes('localhost:undefined') ||
         message.includes('Failed to construct \'WebSocket\'') ||
         message.includes('wss://localhost:undefined') ||
         stack.includes('localhost:undefined')) &&
        message.includes('WebSocket')) {
      event.preventDefault();
    }
  }, true); // Use capture phase to catch errors early
  
  // Suppress console errors
  const originalError = console.error;
  console.error = (...args) => {
    const errorStr = String(args[0]);
    if (errorStr.includes('WebSocket') && errorStr.includes('localhost:undefined')) {
      return; // Silently suppress
    }
    originalError.apply(console, args);
  };
}

createRoot(document.getElementById("root")!).render(<App />);
// Build 1762146413
