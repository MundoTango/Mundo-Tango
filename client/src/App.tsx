import { useLocation } from "wouter";
import { lazy, Suspense, useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/theme-context";
import { AuthProvider } from "./contexts/AuthContext";
import { MrBlueProvider } from "./contexts/MrBlueContext";
import { TalentMatchSessionProvider } from "./contexts/TalentMatchSessionContext";
import { PredictiveContextProvider } from "./providers/PredictiveContextProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoadingFallback } from "./components/LoadingFallback";
import { GlobalMrBlue } from "./components/mrblue/GlobalMrBlue";
import { ChatSidePanel } from "./components/mrblue/ChatSidePanel";
import { MrBlueFloatingButton } from "./components/mrBlue/MrBlueFloatingButton";
import {
  initErrorDetection,
  cleanupErrorDetection,
} from "./lib/proactiveErrorDetection";
import {
  initHttpInterceptor,
  cleanupHttpInterceptor,
} from "./lib/httpInterceptor";
import {
  initComponentHealthMonitor,
  cleanupComponentHealthMonitor,
} from "./lib/componentHealthMonitor";
import { setupNavigationInterceptor } from "./lib/navigationInterceptor";
import { HEAVY_FEATURES_ENABLED } from "./config/featureFlags";

import { RouteLoader } from "./routes";

const FeatureDisabled = lazy(() => import("./components/FeatureDisabled"));
const VisualEditorSplitPane = HEAVY_FEATURES_ENABLED
  ? lazy(() =>
      import("./components/visual-editor/VisualEditorSplitPane").then((m) => ({
        default: m.VisualEditorSplitPane,
      })),
    )
  : FeatureDisabled;

function AppContent() {
  const [isVisualEditorOpen, setIsVisualEditorOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const enableSelfHealing = !import.meta.env.DEV || import.meta.env.VITE_ENABLE_SELF_HEALING === "true";
    
    if (!enableSelfHealing) {
      console.log("[App] Self-healing systems DISABLED in development mode for performance");
      return;
    }

    console.log("[App] Initializing Proactive Error Detection...");
    const detector = initErrorDetection();

    console.log("[App] Initializing HTTP Interceptor...");
    initHttpInterceptor();

    console.log("[App] Initializing Component Health Monitor...");
    initComponentHealthMonitor();

    console.log("[App] Initializing Navigation Interceptor...");
    setupNavigationInterceptor();

    return () => {
      console.log("[App] Cleaning up Component Health Monitor...");
      cleanupComponentHealthMonitor();

      console.log("[App] Cleaning up HTTP Interceptor...");
      cleanupHttpInterceptor();

      console.log("[App] Cleaning up Proactive Error Detection...");
      cleanupErrorDetection();
    };
  }, []);

  useEffect(() => {
    const checkEditMode = () => {
      const params = new URLSearchParams(window.location.search);
      const editMode = params.get("edit") === "true";
      setIsVisualEditorOpen(editMode);
    };

    checkEditMode();
    window.addEventListener("popstate", checkEditMode);
    const interval = setInterval(checkEditMode, 500);

    return () => {
      window.removeEventListener("popstate", checkEditMode);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <Toaster />
      {/* Marketing Mr. Blue for guests (FAQ only) - rendered via MrBlueProvider/Context */}
      <GlobalMrBlue />
      <ChatSidePanel />
      {/* Full-featured Mr. Blue for authenticated users - RBAC gated */}
      <MrBlueFloatingButton />
      <Suspense fallback={<LoadingFallback />}>
        <RouteLoader />
      </Suspense>
      {isVisualEditorOpen && (
        <Suspense fallback={<LoadingFallback />}>
          <VisualEditorSplitPane
            isOpen={isVisualEditorOpen}
            onClose={() => setIsVisualEditorOpen(false)}
          />
        </Suspense>
      )}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <TalentMatchSessionProvider>
              <PredictiveContextProvider>
                <MrBlueProvider>
                  <TooltipProvider>
                    <AppContent />
                  </TooltipProvider>
                </MrBlueProvider>
              </PredictiveContextProvider>
            </TalentMatchSessionProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
export const REBUILD_TIMESTAMP = Date.now();
