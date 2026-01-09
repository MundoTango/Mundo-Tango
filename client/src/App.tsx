import { useLocation } from "wouter";
import { lazy, Suspense, useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/theme-context";
import { AuthProvider } from "./contexts/AuthContext";
import { MrBlueProvider } from "./contexts/MrBlueContext";
import { BreadcrumbProvider } from "./contexts/BreadcrumbContext";
import { startNetworkInterceptor } from "./lib/qa/networkInterceptor";
import { TalentMatchSessionProvider } from "./contexts/TalentMatchSessionContext";
import { PredictiveContextProvider } from "./providers/PredictiveContextProvider";
import { NotificationWebSocketProvider } from "./contexts/NotificationWebSocketContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoadingFallback } from "./components/LoadingFallback";
import { GlobalMrBlue } from "./components/mrBlue/core/GlobalMrBlue";
import { MrBlueFloatingButton } from "./components/mrBlue/core/MrBlueFloatingButton";
import { CookieConsent } from "./components/marketing/CookieConsent";
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
import { detectAndApplyLanguage } from "./lib/i18n";
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
  const [i18nReady, setI18nReady] = useState(false);
  const [location] = useLocation();

  // Initialize i18n with correct language BEFORE first meaningful render
  useEffect(() => {
    const initI18n = async () => {
      await detectAndApplyLanguage();
      setI18nReady(true);
    };
    initI18n();
  }, [location]);

  // Start network interceptor for QA diagnostics
  useEffect(() => {
    startNetworkInterceptor();
  }, []);

  useEffect(() => {
    const enableSelfHealing = !import.meta.env.DEV || import.meta.env.VITE_ENABLE_SELF_HEALING === "true";
    
    if (!enableSelfHealing) {
      console.log("[App] Self-healing systems DISABLED in development mode for performance");
      return;
    }

    try {
      console.log("[App] Initializing Proactive Error Detection...");
      initErrorDetection();

      console.log("[App] Initializing HTTP Interceptor...");
      initHttpInterceptor();

      console.log("[App] Initializing Component Health Monitor...");
      initComponentHealthMonitor();

      console.log("[App] Initializing Navigation Interceptor...");
      setupNavigationInterceptor();
    } catch (error) {
      console.error("[App] Self-healing initialization failed, continuing without:", error);
    }

    return () => {
      try {
        console.log("[App] Cleaning up Component Health Monitor...");
        cleanupComponentHealthMonitor();

        console.log("[App] Cleaning up HTTP Interceptor...");
        cleanupHttpInterceptor();

        console.log("[App] Cleaning up Proactive Error Detection...");
        cleanupErrorDetection();
      } catch (error) {
        console.error("[App] Self-healing cleanup failed:", error);
      }
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

  const marketingPaths = [
    '/landing', '/lander', '/for-dancers', '/for-teachers', '/for-organizers',
    '/tango-roles', '/support', '/donate', '/supporters', '/volunteer',
    '/ambassadors', '/open-source', '/about', '/features', '/testimonials',
    '/discover', '/terms', '/privacy', '/community-guidelines', '/help',
    '/help-center', '/contact', '/about-tango', '/h2ac', '/demos', '/faq',
    '/login', '/register', '/auth', '/forgot-password', '/reset-password'
  ];
  const isMarketingPage = marketingPaths.some(path => location.startsWith(path));

  // Wait for i18n to be ready before rendering marketing pages to prevent English fallbacks
  if (isMarketingPage && !i18nReady) {
    return <LoadingFallback />;
  }

  return (
    <> 
      <Toaster />
      {!isMarketingPage && (
        <> 
          <GlobalMrBlue />
          <MrBlueFloatingButton />
        </>
      )}
      <Suspense fallback={<LoadingFallback />}> 
        <RouteLoader />
      </Suspense>
      <CookieConsent />
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
                  <BreadcrumbProvider>
                    <NotificationWebSocketProvider>
                      <TooltipProvider>
                        <AppContent />
                      </TooltipProvider>
                    </NotificationWebSocketProvider>
                  </BreadcrumbProvider>
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