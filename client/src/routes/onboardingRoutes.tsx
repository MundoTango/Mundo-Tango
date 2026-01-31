import { lazy, Suspense } from "react";
import { Route } from "wouter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingFallback } from "@/components/LoadingFallback";

const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));
const WelcomeTourPage = lazy(() => import("@/pages/WelcomeTourPage"));
// ARCHIVED: Onboarding flow pages - moved to _archived/
const FeatureArchivedPage = lazy(() => import("@/pages/FeatureArchivedPage"));
const VolunteerThankYouPage = lazy(() => import("@/pages/FeatureArchivedPage"));

export function OnboardingRoutes() {
  return (
    <>
      <Route path="/onboarding">
        <ProtectedRoute>
          <Suspense fallback={<LoadingFallback />}>
            <OnboardingPage />
          </Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/welcome-tour">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <WelcomeTourPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/onboarding/welcome">
        <ProtectedRoute>
          <Suspense fallback={<LoadingFallback />}>
            <FeatureArchivedPage />
          </Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/onboarding/city">
        <ProtectedRoute>
          <Suspense fallback={<LoadingFallback />}>
            <FeatureArchivedPage />
          </Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/onboarding/social">
        <ProtectedRoute>
          <Suspense fallback={<LoadingFallback />}>
            <FeatureArchivedPage />
          </Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/onboarding/photo">
        <ProtectedRoute>
          <Suspense fallback={<LoadingFallback />}>
            <FeatureArchivedPage />
          </Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/onboarding/roles">
        <ProtectedRoute>
          <Suspense fallback={<LoadingFallback />}>
            <FeatureArchivedPage />
          </Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/onboarding/languages">
        <ProtectedRoute>
          <Suspense fallback={<LoadingFallback />}>
            <FeatureArchivedPage />
          </Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/onboarding/experience">
        <ProtectedRoute>
          <Suspense fallback={<LoadingFallback />}>
            <FeatureArchivedPage />
          </Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/onboarding/tour">
        <ProtectedRoute>
          <Suspense fallback={<LoadingFallback />}>
            <FeatureArchivedPage />
          </Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/onboarding/legal">
        <ProtectedRoute>
          <Suspense fallback={<LoadingFallback />}>
            <FeatureArchivedPage />
          </Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/onboarding/subscription">
        <ProtectedRoute>
          <Suspense fallback={<LoadingFallback />}>
            <FeatureArchivedPage />
          </Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/onboarding/waitlist">
        <ProtectedRoute>
          <Suspense fallback={<LoadingFallback />}>
            <FeatureArchivedPage />
          </Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/volunteer/thank-you">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <VolunteerThankYouPage />
          </Suspense>
        </AppLayout>
      </Route>
    </>
  );
}
