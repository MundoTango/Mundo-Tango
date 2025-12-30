import { lazy, Suspense } from "react";
import { Switch, useLocation } from "wouter";
import { LoadingFallback } from "@/components/LoadingFallback";

const MarketingRoutes = lazy(() =>
  import("./marketingRoutes").then((m) => ({ default: m.MarketingRoutes }))
);
const AdminRoutes = lazy(() =>
  import("./adminRoutes").then((m) => ({ default: m.AdminRoutes }))
);
const LifeCeoRoutes = lazy(() =>
  import("./lifeCeoRoutes").then((m) => ({ default: m.LifeCeoRoutes }))
);
const MrBlueRoutes = lazy(() =>
  import("./mrBlueRoutes").then((m) => ({ default: m.MrBlueRoutes }))
);
const SettingsRoutes = lazy(() =>
  import("./settingsRoutes").then((m) => ({ default: m.SettingsRoutes }))
);
const SocialRoutes = lazy(() =>
  import("./socialRoutes").then((m) => ({ default: m.SocialRoutes }))
);
const EventRoutes = lazy(() =>
  import("./eventRoutes").then((m) => ({ default: m.EventRoutes }))
);
const OnboardingRoutes = lazy(() =>
  import("./onboardingRoutes").then((m) => ({ default: m.OnboardingRoutes }))
);
const AuthRoutes = lazy(() =>
  import("./authRoutes").then((m) => ({ default: m.AuthRoutes }))
);
const TalentRoutes = lazy(() =>
  import("./talentRoutes").then((m) => ({ default: m.TalentRoutes }))
);
const CommerceRoutes = lazy(() =>
  import("./commerceRoutes").then((m) => ({ default: m.CommerceRoutes }))
);
const MiscRoutes = lazy(() =>
  import("./miscRoutes").then((m) => ({ default: m.MiscRoutes }))
);

export function RouteLoader() {
  const [location] = useLocation();

  const getRouteBundle = () => {
    if (location.startsWith("/admin")) {
      return <AdminRoutes />;
    }
    if (location.startsWith("/life-ceo")) {
      return <LifeCeoRoutes />;
    }
    if (location.startsWith("/mrblue") || location.startsWith("/mr-blue") || location.startsWith("/video-studio") || location.startsWith("/avatar") || location.startsWith("/visual-editor")) {
      return <MrBlueRoutes />;
    }
    if (location.startsWith("/settings")) {
      return <SettingsRoutes />;
    }
    if (location.startsWith("/onboarding") || location.startsWith("/welcome-tour")) {
      return <OnboardingRoutes />;
    }
    if (location.startsWith("/login") || location.startsWith("/register") || location.startsWith("/auth") || location.startsWith("/password-reset") || location.startsWith("/forgot-password") || location.startsWith("/reset-password") || location.startsWith("/email-verification") || location.startsWith("/verify-email") || location.startsWith("/2fa")) {
      return <AuthRoutes />;
    }
    if (location.startsWith("/talent-match") || location.startsWith("/enhanced-talent") || location.startsWith("/volunteer-recruitment") || location.startsWith("/volunteer-testing") || location.startsWith("/user-testing") || location.startsWith("/error-detection") || location.startsWith("/premium-features") || location.startsWith("/ai-budget") || location.startsWith("/privacy-hub") || location.startsWith("/god-level") || location.startsWith("/autonomous") || location.startsWith("/my-tasks")) {
      return <TalentRoutes />;
    }
    if (location.startsWith("/events") || location.startsWith("/event-series") || location.startsWith("/event-calendar") || location.startsWith("/my-events") || location.startsWith("/calendar") || location.startsWith("/travel")) {
      return <EventRoutes />;
    }
    if (location.startsWith("/feed") || location.startsWith("/dashboard") || location.startsWith("/home") || location.startsWith("/profile") || location.startsWith("/friends") || location.startsWith("/friend-requests") || location.startsWith("/friendship") || location.startsWith("/followers") || location.startsWith("/following") || location.startsWith("/messages") || location.startsWith("/notifications") || location.startsWith("/groups") || location.startsWith("/community") || location.startsWith("/map") || location.startsWith("/world") || location.startsWith("/cities") || location.startsWith("/city") || location.startsWith("/search") || location.startsWith("/favorites") || location.startsWith("/saved") || location.startsWith("/stories") || location.startsWith("/live") || location.startsWith("/invitations") || location.startsWith("/facebook") || location.startsWith("/closeness") || location.startsWith("/recommendations") || location.startsWith("/gamification") || location.startsWith("/leaderboard") || location.startsWith("/report") || location.startsWith("/reputation") || location.startsWith("/create-post") || location.startsWith("/posts") || location.startsWith("/professional-reputation")) {
      return <SocialRoutes />;
    }
    if (location.startsWith("/marketplace") || location.startsWith("/checkout") || location.startsWith("/billing") || location.startsWith("/payment") || location.startsWith("/subscription") || location.startsWith("/crowdfunding") || location.startsWith("/financial") || location.startsWith("/invoices") || location.startsWith("/booking")) {
      return <CommerceRoutes />;
    }
    if (location.startsWith("/pro/") || location.startsWith("/housing")) {
      return <MiscRoutes />;
    }
    if (location === "/") {
      return <SocialRoutes />;
    }
    if (location.startsWith("/landing") || location.startsWith("/demos") || location.startsWith("/for-dancers") || location.startsWith("/for-teachers") || location.startsWith("/for-organizers") || location.startsWith("/tango-roles") || location.startsWith("/support") || location.startsWith("/donate") || location.startsWith("/supporters") || (location.startsWith("/volunteer") && !location.startsWith("/volunteer-recruitment") && !location.startsWith("/volunteer-testing")) || location.startsWith("/ambassadors") || location.startsWith("/open-source") || location.startsWith("/about") || location.startsWith("/features") || location.startsWith("/pricing") || location.startsWith("/testimonials") || location.startsWith("/discover") || location.startsWith("/terms") || (location.startsWith("/privacy") && !location.startsWith("/privacy-hub")) || location.startsWith("/community-guidelines") || location.startsWith("/help") || location.startsWith("/contact") || location.startsWith("/h2ac") || location.startsWith("/about-tango")) {
      return <MarketingRoutes />;
    }
    return <MiscRoutes />;
  };

  return (
    <Switch>
      <Suspense fallback={<LoadingFallback />}>
        {getRouteBundle()}
      </Suspense>
    </Switch>
  );
}
