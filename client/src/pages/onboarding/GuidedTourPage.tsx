import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Joyride, { Step, CallBackProps, STATUS } from "react-joyride";
import { useAuth } from "@/contexts/AuthContext";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

const TOUR_STEPS: Step[] = [
  {
    target: '[data-tour="feed"]',
    content: "This is your home feed where you'll see posts from your community",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tour="create-post"]',
    content: "Click here to share your thoughts, photos, or videos with the community",
    placement: "bottom",
  },
  {
    target: '[data-tour="events"]',
    content: "Find and join local tango events, classes, and milongas",
    placement: "bottom",
  },
  {
    target: '[data-tour="groups"]',
    content: "Connect with tango groups and communities around the world",
    placement: "bottom",
  },
  {
    target: '[data-tour="messages"]',
    content: "Send direct messages to other dancers and friends",
    placement: "bottom",
  },
  {
    target: '[data-tour="profile"]',
    content: "Manage your profile, settings, and view your posts",
    placement: "left",
  },
];

export default function GuidedTourPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [runTour, setRunTour] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      try {
        const accessToken = localStorage.getItem("accessToken");
        await fetch("/api/users/me", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            isOnboardingComplete: true,
            formStatus: 4,
          }),
        });
        navigate("/feed");
      } catch (error) {
        console.error("Error completing onboarding:", error);
        navigate("/feed");
      }
    }
  };

  return (
    <SelfHealingErrorBoundary pageName="Guided Tour" fallbackRoute="/">
      <PageLayout title="GuidedTour" showBreadcrumbs>
<>
      <SEO title="Platform Tour - Mundo Tango" description="Take a quick tour of Mundo Tango" />
      <Joyride
        steps={TOUR_STEPS}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: "hsl(var(--primary))",
            textColor: "hsl(var(--foreground))",
            backgroundColor: "hsl(var(--background))",
            arrowColor: "hsl(var(--background))",
            overlayColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 10000,
          },
        }}
        locale={{
          back: "Back",
          close: "Close",
          last: "Finish",
          next: "Next",
          skip: "Skip tour",
        }}
      />
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" />
    </>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
