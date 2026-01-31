import { lazy, Suspense } from "react";
import { Route } from "wouter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingFallback } from "@/components/LoadingFallback";

const TalentMatchPage = lazy(() => import("@/pages/TalentMatchPage"));
const TalentMatchEmbedPage = lazy(() => import("@/pages/TalentMatchEmbedPage"));
const TalentMatchInterviewPage = lazy(() => import("@/pages/TalentMatchInterviewPage"));
const EnhancedTalentMatch = lazy(() => import("@/pages/EnhancedTalentMatch"));
const PremiumFeaturesPage = lazy(() => import("@/pages/PremiumFeaturesPage"));
const AIBudgetBuilder = lazy(() => import("@/pages/AIBudgetBuilder"));
const PrivacyHub = lazy(() => import("@/pages/PrivacyHub"));
const GodLevelDashboard = lazy(() => import("@/pages/GodLevelDashboard"));
const MyTasksPage = lazy(() => import("@/pages/MyTasksPage"));
// ARCHIVED: Using placeholder page for archived features
const FeatureArchivedPage = lazy(() => import("@/pages/FeatureArchivedPage"));

export function TalentRoutes() {
  return (
    <>
      <Route path="/talent-match">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <TalentMatchPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/talent-match-embed">
        <Suspense fallback={<LoadingFallback />}>
          <TalentMatchEmbedPage />
        </Suspense>
      </Route>
      <Route path="/talent-match-interview">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <TalentMatchInterviewPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/enhanced-talent-match">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <EnhancedTalentMatch />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/user-testing">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeatureArchivedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/volunteer-recruitment">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeatureArchivedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/volunteer-testing">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeatureArchivedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/error-detection-test">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeatureArchivedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/autonomous">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeatureArchivedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/premium-features">
        <Suspense fallback={<LoadingFallback />}>
          <PremiumFeaturesPage />
        </Suspense>
      </Route>
      <Route path="/ai-budget-builder">
        <Suspense fallback={<LoadingFallback />}>
          <AIBudgetBuilder />
        </Suspense>
      </Route>
      <Route path="/privacy-hub">
        <Suspense fallback={<LoadingFallback />}>
          <PrivacyHub />
        </Suspense>
      </Route>
      <Route path="/god-level">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <GodLevelDashboard />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/autonomous">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <AutonomousPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/my-tasks">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <MyTasksPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
    </>
  );
}
