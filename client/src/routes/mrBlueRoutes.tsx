import { lazy, Suspense } from "react";
import { Route } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { LoadingFallback } from "@/components/LoadingFallback";
import { HEAVY_FEATURES_ENABLED } from "@/config/featureFlags";

const FeatureDisabled = lazy(() => import("@/components/FeatureDisabled"));

const MrBlueChatPage = lazy(() => import("@/pages/MrBlueChatPage"));
const VideoStudio = lazy(() => import("@/pages/VideoStudio"));
const MrBlueVideoDemo = lazy(() => import("@/pages/mr-blue-video-demo"));
const MrBlueAvatarDemo = HEAVY_FEATURES_ENABLED
  ? lazy(() => import("@/pages/mr-blue-avatar-demo"))
  : FeatureDisabled;
const MrBlueStudioPage = lazy(() => import("@/pages/mr-blue-studio"));
const MrBlueAvatar3DPage = HEAVY_FEATURES_ENABLED
  ? lazy(() => import("@/pages/mr-blue-avatar-3d"))
  : FeatureDisabled;
const AvatarDesignerPage = HEAVY_FEATURES_ENABLED
  ? lazy(() => import("@/pages/AvatarDesignerPage"))
  : FeatureDisabled;
const MrBlueVoicePage = lazy(() => import("@/pages/mrblue/VoicePage"));
const MrBlueVibecodingPage = lazy(() => import("@/pages/mrblue/VibecodingPage"));
const MrBlueSettingsPage = lazy(() => import("@/pages/mrblue/SettingsPage"));
const MrBlueContextMemoryPage = lazy(() => import("@/pages/mrblue/ContextMemoryPage"));
const MrBlueAnalyticsPage = lazy(() => import("@/pages/mrblue/AnalyticsPage"));
const MrBlueOnboardingPage = lazy(() => import("@/pages/mrblue/OnboardingPage"));
const UnifiedMrBlue = HEAVY_FEATURES_ENABLED
  ? lazy(() => import("@/components/mrBlue/core/UnifiedMrBlue"))
  : FeatureDisabled;
const VisualEditorMode = HEAVY_FEATURES_ENABLED
  ? lazy(() =>
      import("@/components/mrBlue/advanced/VisualEditorMode").then((m) => ({
        default: m.VisualEditorMode,
      })),
    )
  : FeatureDisabled;
const VisualEditorPage = lazy(() => import("@/pages/VisualEditorPage"));

export function MrBlueRoutes() {
  return (
    <>
      <Route path="/mr-blue-chat">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <MrBlueChatPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/video-studio">
        <Suspense fallback={<LoadingFallback />}>
          <VideoStudio />
        </Suspense>
      </Route>
      <Route path="/mr-blue-demo">
        <Suspense fallback={<LoadingFallback />}>
          <MrBlueVideoDemo />
        </Suspense>
      </Route>
      <Route path="/mr-blue-avatar-demo">
        <Suspense fallback={<LoadingFallback />}>
          <MrBlueAvatarDemo />
        </Suspense>
      </Route>
      <Route path="/mr-blue-studio">
        <Suspense fallback={<LoadingFallback />}>
          <MrBlueStudioPage />
        </Suspense>
      </Route>
      <Route path="/mr-blue-avatar-3d">
        <Suspense fallback={<LoadingFallback />}>
          <MrBlueAvatar3DPage />
        </Suspense>
      </Route>
      <Route path="/avatar-designer">
        <Suspense fallback={<LoadingFallback />}>
          <AvatarDesignerPage />
        </Suspense>
      </Route>
      <Route path="/mrblue/voice">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <MrBlueVoicePage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/mrblue/vibecoding">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <MrBlueVibecodingPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/mrblue/visual-editor">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <VisualEditorMode />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/mrblue/settings">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <MrBlueSettingsPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/mrblue/context-memory">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <MrBlueContextMemoryPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/mrblue/analytics">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <MrBlueAnalyticsPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/mrblue/onboarding">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <MrBlueOnboardingPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/mrblue">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <UnifiedMrBlue />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/visual-editor">
        <Suspense fallback={<LoadingFallback />}>
          <VisualEditorPage />
        </Suspense>
      </Route>
    </>
  );
}
