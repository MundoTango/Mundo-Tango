import { lazy, Suspense, useEffect } from "react";
import { Route, Redirect, useLocation } from "wouter";
import { LoadingFallback } from "@/components/LoadingFallback";
import { useAuth } from "@/contexts/AuthContext";

// Redirect component that preserves query params
function RedirectWithQuery({ to }: { to: string }) {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    const queryString = window.location.search;
    const targetUrl = queryString ? `${to}${queryString}` : to;
    setLocation(targetUrl, { replace: true });
  }, [to, setLocation]);
  
  return null;
}

const LandingPage = lazy(() => import("@/pages/LandingPage"));
const DemosPage = lazy(() => import("@/pages/DemosPage"));
const ForDancersPage = lazy(() => import("@/pages/marketing/ForDancersPage"));
const ForTeachersPage = lazy(() => import("@/pages/marketing/ForTeachersPage"));
const ForOrganizersPage = lazy(() => import("@/pages/marketing/ForOrganizersPage"));
const MarketingTangoRolesPage = lazy(() => import("@/pages/marketing/TangoRolesPage"));
const SupportPage = lazy(() => import("@/pages/marketing/SupportPage"));
const DonatePage = lazy(() => import("@/pages/DonatePage"));
const SupportersPage = lazy(() => import("@/pages/marketing/SupportersPage"));
const VolunteerPage = lazy(() => import("@/pages/marketing/VolunteerPage"));
const AmbassadorsPage = lazy(() => import("@/pages/marketing/AmbassadorsPage"));
const OpenSourcePage = lazy(() => import("@/pages/marketing/OpenSourcePage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const FeaturesPage = lazy(() => import("@/pages/FeaturesPage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const TestimonialsPage = lazy(() => import("@/pages/TestimonialsPage"));
const DiscoverPage = lazy(() => import("@/pages/DiscoverPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const PrivacyPolicyPage = lazy(() => import("@/pages/PrivacyPolicyPage"));
const CommunityGuidelinesPage = lazy(() => import("@/pages/CommunityGuidelinesPage"));
const HelpPage = lazy(() => import("@/pages/HelpPage"));
const HelpCenterPage = lazy(() => import("@/pages/HelpCenterPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const AboutTangoPage = lazy(() => import("@/pages/AboutTangoPage"));
const H2ACDashboardPage = lazy(() => import("@/pages/H2ACDashboardPage"));

export function MarketingRoutes() {
  const { user } = useAuth();
  return (
    <>
      <Route path="/">
        {user ? <Redirect to="/feed" /> : <RedirectWithQuery to="/landing" />}
      </Route>
      <Route path="/lander">
        <RedirectWithQuery to="/landing" />
      </Route>
      <Route path="/landing">
        <Suspense fallback={<LoadingFallback />}>
          <LandingPage />
        </Suspense>
      </Route>
      <Route path="/demos">
        <Suspense fallback={<LoadingFallback />}>
          <DemosPage />
        </Suspense>
      </Route>
      <Route path="/for-dancers">
        <Suspense fallback={<LoadingFallback />}>
          <ForDancersPage />
        </Suspense>
      </Route>
      <Route path="/for-teachers">
        <Suspense fallback={<LoadingFallback />}>
          <ForTeachersPage />
        </Suspense>
      </Route>
      <Route path="/for-organizers">
        <Suspense fallback={<LoadingFallback />}>
          <ForOrganizersPage />
        </Suspense>
      </Route>
      <Route path="/tango-roles">
        <Suspense fallback={<LoadingFallback />}>
          <MarketingTangoRolesPage />
        </Suspense>
      </Route>
      <Route path="/support">
        <Suspense fallback={<LoadingFallback />}>
          <SupportPage />
        </Suspense>
      </Route>
      <Route path="/donate">
        <Suspense fallback={<LoadingFallback />}>
          <DonatePage />
        </Suspense>
      </Route>
      <Route path="/supporters">
        <Suspense fallback={<LoadingFallback />}>
          <SupportersPage />
        </Suspense>
      </Route>
      <Route path="/volunteer">
        <Suspense fallback={<LoadingFallback />}>
          <VolunteerPage />
        </Suspense>
      </Route>
      <Route path="/ambassadors">
        <Suspense fallback={<LoadingFallback />}>
          <AmbassadorsPage />
        </Suspense>
      </Route>
      <Route path="/open-source">
        <Suspense fallback={<LoadingFallback />}>
          <OpenSourcePage />
        </Suspense>
      </Route>
      <Route path="/about">
        <Suspense fallback={<LoadingFallback />}>
          <AboutPage />
        </Suspense>
      </Route>
      <Route path="/features">
        <Suspense fallback={<LoadingFallback />}>
          <FeaturesPage />
        </Suspense>
      </Route>
      <Route path="/pricing">
        <Suspense fallback={<LoadingFallback />}>
          <PricingPage />
        </Suspense>
      </Route>
      <Route path="/testimonials">
        <Suspense fallback={<LoadingFallback />}>
          <TestimonialsPage />
        </Suspense>
      </Route>
      <Route path="/discover">
        <Suspense fallback={<LoadingFallback />}>
          <DiscoverPage />
        </Suspense>
      </Route>
      <Route path="/pro">
        <Redirect to="/discover" />
      </Route>
      <Route path="/terms">
        <Suspense fallback={<LoadingFallback />}>
          <TermsPage />
        </Suspense>
      </Route>
      <Route path="/privacy">
        <Suspense fallback={<LoadingFallback />}>
          <PrivacyPolicyPage />
        </Suspense>
      </Route>
      <Route path="/community-guidelines">
        <Suspense fallback={<LoadingFallback />}>
          <CommunityGuidelinesPage />
        </Suspense>
      </Route>
      <Route path="/help">
        <Suspense fallback={<LoadingFallback />}>
          <HelpPage />
        </Suspense>
      </Route>
      <Route path="/help-center">
        <Suspense fallback={<LoadingFallback />}>
          <HelpCenterPage />
        </Suspense>
      </Route>
      <Route path="/contact">
        <Suspense fallback={<LoadingFallback />}>
          <ContactPage />
        </Suspense>
      </Route>
      <Route path="/about-tango">
        <Suspense fallback={<LoadingFallback />}>
          <AboutTangoPage />
        </Suspense>
      </Route>
      <Route path="/h2ac">
        <Suspense fallback={<LoadingFallback />}>
          <H2ACDashboardPage />
        </Suspense>
      </Route>
    </>
  );
}
