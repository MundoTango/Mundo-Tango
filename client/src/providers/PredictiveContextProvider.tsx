import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";

interface Prediction {
  page: string;
  confidence: number;
}

interface PredictiveContextType {
  predictions: Prediction[];
  isPredicting: boolean;
  predictNextPages: (currentPage: string) => Promise<void>;
  recordHit: (currentPage: string, actualNextPage: string) => Promise<void>;
  warmCache: (page: string) => Promise<void>;
}

const PredictiveContext = createContext<PredictiveContextType | undefined>(undefined);

export function PredictiveContextProvider({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isPredicting, setIsPredicting] = useState(false);
  
  const previousPageRef = useRef<string | null>(null);
  const pageEnterTimeRef = useRef<number>(Date.now());
  const hasWarmedCacheRef = useRef(false);

  // Track navigation patterns
  useEffect(() => {
    if (!user) return;

    const currentPage = location;
    const previousPage = previousPageRef.current;
    const timeOnPage = Date.now() - pageEnterTimeRef.current;

    // Track navigation if we have a previous page
    if (previousPage && previousPage !== currentPage) {
      trackNavigation(previousPage, currentPage, timeOnPage);
    }

    // Record hit/miss if we had predictions
    if (previousPage && predictions.length > 0) {
      recordHit(previousPage, currentPage);
    }

    // Update refs for next navigation
    previousPageRef.current = currentPage;
    pageEnterTimeRef.current = Date.now();
  }, [location, user]);

  // Warm cache on login
  useEffect(() => {
    if (user && !hasWarmedCacheRef.current) {
      warmCache(location);
      hasWarmedCacheRef.current = true;
    }
  }, [user, location]);

  const trackNavigation = async (fromPage: string, toPage: string, timeOnPage: number) => {
    try {
      await apiRequest("POST", "/api/predictive/track", {
        fromPage,
        toPage,
        timeOnPage,
      });
    } catch (error) {
      console.error("Failed to track navigation:", error);
    }
  };

  const predictNextPages = async (currentPage: string) => {
    if (!user || isPredicting) return;

    setIsPredicting(true);
    try {
      const response = await apiRequest("GET", `/api/predictive/predict?currentPage=${encodeURIComponent(currentPage)}`);
      const data = await response.json();
      setPredictions(data.predictions || []);
      
      // Prefetch top 3 predictions
      const topPredictions = (data.predictions || []).slice(0, 3);
      for (const prediction of topPredictions) {
        prefetchPage(prediction.page);
      }
    } catch (error) {
      console.error("Failed to predict next pages:", error);
      setPredictions([]);
    } finally {
      setIsPredicting(false);
    }
  };

  const prefetchPage = async (page: string) => {
    try {
      // Prefetch by creating a link and triggering prefetch
      // This is a simple implementation - in production, you might want to:
      // 1. Prefetch API data for the page
      // 2. Preload components
      // 3. Warm up the router cache
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = page;
      document.head.appendChild(link);
      
      // Clean up after a delay
      setTimeout(() => {
        document.head.removeChild(link);
      }, 5000);
    } catch (error) {
      console.error("Failed to prefetch page:", page, error);
    }
  };

  const recordHit = async (currentPage: string, actualNextPage: string) => {
    try {
      await apiRequest("POST", "/api/predictive/record-hit", {
        currentPage,
        actualNextPage,
      });
    } catch (error) {
      console.error("Failed to record hit:", error);
    }
  };

  const warmCache = async (page: string) => {
    try {
      await apiRequest("POST", "/api/predictive/warm-cache", {
        currentPage: page,
      });
    } catch (error) {
      console.error("Failed to warm cache:", error);
    }
  };

  return (
    <PredictiveContext.Provider
      value={{
        predictions,
        isPredicting,
        predictNextPages,
        recordHit,
        warmCache,
      }}
    >
      {children}
    </PredictiveContext.Provider>
  );
}

export function usePredictiveContext() {
  const context = useContext(PredictiveContext);
  if (context === undefined) {
    throw new Error("usePredictiveContext must be used within a PredictiveContextProvider");
  }
  return context;
}
