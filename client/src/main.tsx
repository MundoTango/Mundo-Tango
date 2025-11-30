import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/visual-editor.css";
import "./lib/i18n";

// Suppress Vite HMR WebSocket errors in development
// These occur when HMR falls back to localhost:undefined during reconnection
if (import.meta.env.DEV) {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('localhost:undefined') ||
        event.reason?.message?.includes('Failed to construct \'WebSocket\'')) {
      event.preventDefault();
      console.debug('[Vite HMR] Suppressed WebSocket fallback error');
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
// Build 1762146413
