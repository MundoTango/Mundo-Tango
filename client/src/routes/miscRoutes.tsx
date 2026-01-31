import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingFallback } from "@/components/LoadingFallback";
import { HEAVY_FEATURES_ENABLED } from "@/config/featureFlags";
import NotFound from "@/pages/not-found";

const FeatureDisabled = lazy(() => import("@/components/FeatureDisabled"));

const TeachersPage = lazy(() => import("@/pages/TeachersPage"));
const TeacherDetailPage = lazy(() => import("@/pages/TeacherDetailPage"));
const TeacherProfilePage = lazy(() => import("@/pages/TeacherProfilePage"));
const VenuesPage = lazy(() => import("@/pages/VenuesPage"));
const TutorialsPage = lazy(() => import("@/pages/TutorialsPage"));
const TutorialDetailPage = lazy(() => import("@/pages/TutorialDetailPage"));
const WorkshopsPage = lazy(() => import("@/pages/WorkshopsPage"));
const WorkshopDetailPage = lazy(() => import("@/pages/WorkshopDetailPage"));
const VideoLessonsPage = lazy(() => import("@/pages/VideoLessonsPage"));
const DanceStylesPage = lazy(() => import("@/pages/DanceStylesPage"));
const DanceStylesDetailPage = lazy(() => import("@/pages/DanceStylesDetailPage"));
const PartnerFinderPage = lazy(() => import("@/pages/PartnerFinderPage"));
const HostHomesPage = lazy(() => import("@/pages/HostHomesPage"));
const HostHomePage = lazy(() => import("@/pages/housing/HostHomePage"));
const HousingMarketplacePage = lazy(() => import("@/pages/HousingMarketplacePage"));
const HousingListingDetailPage = lazy(() => import("@/pages/HousingListingDetailPage"));
const HousingSearchPage = lazy(() => import("@/pages/HousingSearchPage"));
const CreateListingPage = lazy(() => import("@/pages/housing/CreateListingPage"));
const NewsletterPage = lazy(() => import("@/pages/NewsletterPage"));
const StreamDetailPage = lazy(() => import("@/pages/StreamDetailPage"));
const ReviewsPage = lazy(() => import("@/pages/ReviewsPage"));
const BlogDetailPage = lazy(() => import("@/pages/BlogDetailPage"));
const VenueRecommendationsPage = lazy(() => import("@/pages/VenueRecommendationsPage"));
const ContentModerationPage = lazy(() => import("@/pages/ContentModerationPage"));
const AnalyticsDashboardPage = HEAVY_FEATURES_ENABLED
  ? lazy(() => import("@/pages/AnalyticsDashboardPage"))
  : FeatureDisabled;
const UserAnalyticsPage = HEAVY_FEATURES_ENABLED
  ? lazy(() => import("@/pages/UserAnalyticsPage"))
  : FeatureDisabled;
const MonitoringPage = HEAVY_FEATURES_ENABLED
  ? lazy(() => import("@/pages/MonitoringPage"))
  : FeatureDisabled;
const LegalDashboardPage = lazy(() => import("@/pages/legal/LegalDashboardPage"));
const LegalDocumentsPage = lazy(() => import("@/pages/legal/LegalDocumentsPage"));
const LegalDocumentDetailPage = lazy(() => import("@/pages/legal/LegalDocumentDetailPage"));
const LegalTemplatesPage = lazy(() => import("@/pages/legal/LegalTemplatesPage"));
const LegalSignaturePage = lazy(() => import("@/pages/legal/LegalSignaturePage"));
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage"));
const UsernameProfilePage = lazy(() => import("@/pages/UsernameProfilePage"));
// ARCHIVED: Using placeholder for archived features
const FeatureArchivedPage = lazy(() => import("@/pages/FeatureArchivedPage"));

const PROLearningPage = lazy(() => import("@/pages/pro/PROGroupPublicPage").then((m) => ({ default: m.LearningPage })));
const PROMusicPage = lazy(() => import("@/pages/pro/PROGroupPublicPage").then((m) => ({ default: m.MusicPage })));
const PROMediaGalleryPage = lazy(() => import("@/pages/pro/PROGroupPublicPage").then((m) => ({ default: m.MediaGalleryPage })));
const PROPerformancesPage = lazy(() => import("@/pages/pro/PROGroupPublicPage").then((m) => ({ default: m.PerformancesPage })));
const PROVenuesPage = lazy(() => import("@/pages/pro/PROGroupPublicPage").then((m) => ({ default: m.VenuesPage })));
const PROOrganizersPage = lazy(() => import("@/pages/pro/PROGroupPublicPage").then((m) => ({ default: m.OrganizersPage })));
const PROStoriesBlogPage = lazy(() => import("@/pages/pro/PROGroupPublicPage").then((m) => ({ default: m.StoriesBlogPage })));
const PROArtistsPage = lazy(() => import("@/pages/pro/PROGroupPublicPage").then((m) => ({ default: m.ArtistsPage })));
const PROMusiciansPage = lazy(() => import("@/pages/pro/PROGroupPublicPage").then((m) => ({ default: m.MusiciansPage })));
const PROClothingDesignersPage = lazy(() => import("@/pages/pro/PROGroupPublicPage").then((m) => ({ default: m.ClothingDesignersPage })));
const PROHistoriansPage = lazy(() => import("@/pages/pro/PROGroupPublicPage").then((m) => ({ default: m.HistoriansPage })));
const PROCoachesPage = lazy(() => import("@/pages/pro/PROGroupPublicPage").then((m) => ({ default: m.CoachesPage })));
const PROHostsMCsPage = lazy(() => import("@/pages/pro/PROGroupPublicPage").then((m) => ({ default: m.HostsMCsPage })));
const PROVendorsPage = lazy(() => import("@/pages/pro/PROGroupPublicPage").then((m) => ({ default: m.VendorsPage })));
const PROCommunityBuildersPage = lazy(() => import("@/pages/pro/PROGroupPublicPage").then((m) => ({ default: m.CommunityBuildersPage })));
const PROTaxiDancersPage = lazy(() => import("@/pages/pro/PROGroupPublicPage").then((m) => ({ default: m.TaxiDancersPage })));
const PRODancersPage = lazy(() => import("@/pages/pro/PROGroupPublicPage").then((m) => ({ default: m.DancersPage })));
const PROResearchersPage = lazy(() => import("@/pages/pro/PROGroupPublicPage").then((m) => ({ default: m.ResearchersPage })));
const ProPage = lazy(() => import("@/pages/ProPage"));
const ProPageSettings = lazy(() => import("@/pages/ProPageSettings"));
const AlertsPage = lazy(() => import("@/pages/pro/AlertsPage"));

export function MiscRoutes() {
  return (
    <Switch>
      <Route path="/teachers">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <TeachersPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/teachers/:id">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <TeacherDetailPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/teacher/:id">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <TeacherProfilePage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/venues">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <VenuesPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/tutorials">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <TutorialsPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/tutorials/:id">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <TutorialDetailPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/workshops">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <WorkshopsPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/workshops/:id">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <WorkshopDetailPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/video-lessons">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <VideoLessonsPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/dance-styles">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <DanceStylesPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/dance-styles/:id">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <DanceStylesDetailPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/partner-finder">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <PartnerFinderPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/music-library">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <FeatureArchivedPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/host-homes">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <HostHomesPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/housing/host/:id">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <HostHomePage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/housing/create">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <CreateListingPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/housing/listing/:id">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <HousingListingDetailPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/housing/search">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <HousingSearchPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/housing">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <HousingMarketplacePage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/albums">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeatureArchivedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/albums/:id">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeatureArchivedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/newsletter">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <NewsletterPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/stream/:id">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <StreamDetailPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/reviews">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <ReviewsPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/media-gallery">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <FeatureArchivedPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/blog/:slug">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <BlogDetailPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/venue-recommendations">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <VenueRecommendationsPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/content-moderation">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <ContentModerationPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/analytics-dashboard">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <AnalyticsDashboardPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/user-analytics">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <UserAnalyticsPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/monitoring">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <MonitoringPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/legal">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <LegalDashboardPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/legal/documents">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <LegalDocumentsPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/legal/documents/:id">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <LegalDocumentDetailPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/legal/templates">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <LegalTemplatesPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/legal/signature">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <LegalSignaturePage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/social-media">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeatureArchivedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/social-media/composer">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeatureArchivedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/social-media/connections">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeatureArchivedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/social-media/campaigns">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              < FeatureArchivedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/marketing/seo">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeatureArchivedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/marketing/content">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeatureArchivedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/marketing/social">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeatureArchivedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/marketing/email">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeatureArchivedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/marketing/analytics">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeatureArchivedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/hr/recruiter">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeatureArchivedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/hr/onboarding">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeatureArchivedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/hr/performance">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeatureArchivedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/hr/retention">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeatureArchivedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/hr/culture">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeatureArchivedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/platform">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeatureArchivedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/secrets">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeatureArchivedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/git">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeatureArchivedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/analytics">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <AnalyticsPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/esa">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeatureArchivedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/esa/tasks">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeatureArchivedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/esa/communications">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeatureArchivedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/agent-tasks">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeatureArchivedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/agent-communications">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeatureArchivedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/pro/learning"><AppLayout><Suspense fallback={<LoadingFallback />}><PROLearningPage /></Suspense></AppLayout></Route>
      <Route path="/pro/music"><AppLayout><Suspense fallback={<LoadingFallback />}><PROMusicPage /></Suspense></AppLayout></Route>
      <Route path="/pro/media"><AppLayout><Suspense fallback={<LoadingFallback />}><PROMediaGalleryPage /></Suspense></AppLayout></Route>
      <Route path="/pro/performances"><AppLayout><Suspense fallback={<LoadingFallback />}><PROPerformancesPage /></Suspense></AppLayout></Route>
      <Route path="/pro/venues"><AppLayout><Suspense fallback={<LoadingFallback />}><PROVenuesPage /></Suspense></AppLayout></Route>
      <Route path="/pro/organizers"><AppLayout><Suspense fallback={<LoadingFallback />}><PROOrganizersPage /></Suspense></AppLayout></Route>
      <Route path="/pro/stories"><AppLayout><Suspense fallback={<LoadingFallback />}><PROStoriesBlogPage /></Suspense></AppLayout></Route>
      <Route path="/pro/artists"><AppLayout><Suspense fallback={<LoadingFallback />}><PROArtistsPage /></Suspense></AppLayout></Route>
      <Route path="/pro/musicians"><AppLayout><Suspense fallback={<LoadingFallback />}><PROMusiciansPage /></Suspense></AppLayout></Route>
      <Route path="/pro/clothing"><AppLayout><Suspense fallback={<LoadingFallback />}><PROClothingDesignersPage /></Suspense></AppLayout></Route>
      <Route path="/pro/historians"><AppLayout><Suspense fallback={<LoadingFallback />}><PROHistoriansPage /></Suspense></AppLayout></Route>
      <Route path="/pro/coaches"><AppLayout><Suspense fallback={<LoadingFallback />}><PROCoachesPage /></Suspense></AppLayout></Route>
      <Route path="/pro/hosts"><AppLayout><Suspense fallback={<LoadingFallback />}><PROHostsMCsPage /></Suspense></AppLayout></Route>
      <Route path="/pro/vendors"><AppLayout><Suspense fallback={<LoadingFallback />}><PROVendorsPage /></Suspense></AppLayout></Route>
      <Route path="/pro/community"><AppLayout><Suspense fallback={<LoadingFallback />}><PROCommunityBuildersPage /></Suspense></AppLayout></Route>
      <Route path="/pro/taxi-dancers"><AppLayout><Suspense fallback={<LoadingFallback />}><PROTaxiDancersPage /></Suspense></AppLayout></Route>
      <Route path="/pro/dancers"><AppLayout><Suspense fallback={<LoadingFallback />}><PRODancersPage /></Suspense></AppLayout></Route>
      <Route path="/pro/researchers"><AppLayout><Suspense fallback={<LoadingFallback />}><PROResearchersPage /></Suspense></AppLayout></Route>
      <Route path="/pro/alerts">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <AlertsPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/pro/settings">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <ProPageSettings />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/p/:slug">
        <Suspense fallback={<LoadingFallback />}>
          <ProPage />
        </Suspense>
      </Route>
      <Route path="/:username">
        <Suspense fallback={<LoadingFallback />}>
          <UsernameProfilePage />
        </Suspense>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}
