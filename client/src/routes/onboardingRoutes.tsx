import { lazy, Suspense } from "react";
import { Route } from "wouter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import { LoadingFallback } from "@/components/LoadingFallback";

const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));
const WelcomeTourPage = lazy(() => import("@/pages/WelcomeTourPage"));
const WelcomePage = lazy(() => import("@/pages/onboarding/WelcomePage"));
const CitySelectionPage = lazy(() => import("@/pages/onboarding/CitySelectionPage"));
const SocialConnectPage = lazy(() => import("@/pages/onboarding/SocialConnectPage"));
const PhotoUploadPage = lazy(() => import("@/pages/onboarding/PhotoUploadPage"));
const TangoRolesPage = lazy(() => import("@/pages/onboarding/TangoRolesPage"));
const LanguagesPage = lazy(() => import("@/pages/onboarding/LanguagesPage"));
const DanceExperiencePage = lazy(() => import("@/pages/onboarding/DanceExperiencePage"));
const GuidedTourPage = lazy(() => import("@/pages/onboarding/GuidedTourPage"));
const LegalAcceptance = lazy(() => import("@/pages/onboarding/LegalAcceptance"));
const SubscriptionOnboarding = lazy(() => import("@/pages/onboarding/SubscriptionOnboarding"));
const WaitlistConfirmationPage = lazy(() => import("@/pages/onboarding/WaitlistConfirmationPage"));
const VolunteerThankYouPage = lazy(() => import("@/pages/VolunteerThankYouPage"));

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
            <WelcomePage />
          </Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/onboarding/city">
        <ProtectedRoute>
          <Suspense fallback={<LoadingFallback />}>
            <CitySelectionPage />
          </Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/onboarding/social">
        <ProtectedRoute>
          <Suspense fallback={<LoadingFallback />}>
            <SocialConnectPage />
          </Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/onboarding/photo">
        <ProtectedRoute>
          <Suspense fallback={<LoadingFallback />}>
            <PhotoUploadPage />
          </Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/onboarding/roles">
        <ProtectedRoute>
          <Suspense fallback={<LoadingFallback />}>
            <TangoRolesPage />
          </Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/onboarding/languages">
        <ProtectedRoute>
          <Suspense fallback={<LoadingFallback />}>
            <LanguagesPage />
          </Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/onboarding/experience">
        <ProtectedRoute>
          <Suspense fallback={<LoadingFallback />}>
            <DanceExperiencePage />
          </Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/onboarding/tour">
        <ProtectedRoute>
          <Suspense fallback={<LoadingFallback />}>
            <GuidedTourPage />
          </Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/onboarding/legal">
        <ProtectedRoute>
          <Suspense fallback={<LoadingFallback />}>
            <LegalAcceptance />
          </Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/onboarding/subscription">
        <ProtectedRoute>
          <Suspense fallback={<LoadingFallback />}>
            <SubscriptionOnboarding />
          </Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/onboarding/waitlist">
        <ProtectedRoute>
          <Suspense fallback={<LoadingFallback />}>
            <WaitlistConfirmationPage />
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
