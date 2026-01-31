import { lazy, Suspense } from "react";
import { Route } from "wouter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { LoadingFallback } from "@/components/LoadingFallback";
import { HEAVY_FEATURES_ENABLED } from "@/config/featureFlags";

const FeatureDisabled = lazy(() => import("@/components/FeatureDisabled"));

const TalentPipelinePage = lazy(() => import("@/pages/FeatureArchivedPage"));
const VolunteerDetailsPage = lazy(() => import("@/pages/FeatureArchivedPage"));
const TaskBoardPage = lazy(() => import("@/pages/FeatureArchivedPage"));
const SelfHealingPage = lazy(() => import("@/pages/FeatureArchivedPage"));
const ProjectTrackerPage = lazy(() => import("@/pages/FeatureArchivedPage"));
const UserReportsPage = lazy(() => import("@/pages/admin/UserReportsPage"));
const RoleRequestsPage = lazy(() => import("@/pages/FeatureArchivedPage"));
const EventApprovalsPage = lazy(() => import("@/pages/admin/EventApprovalsPage"));
const AdminEventsPage = lazy(() => import("@/pages/admin/AdminEventsPage"));
const HousingReviewsPage = lazy(() => import("@/pages/admin/HousingReviewsPage"));
const AgentHealthDashboard = lazy(() => import("@/pages/FeatureArchivedPage"));
const AdsManager = lazy(() => import("@/pages/admin/AdsManager"));
const FeedbackQueuePage = lazy(() => import("@/pages/admin/FeedbackQueuePage"));
const SafetyReviewPage = lazy(() => import("@/pages/FeatureArchivedPage"));
const AISupportPage = lazy(() => import("@/pages/FeatureArchivedPage"));
const AdminDashboardPage = lazy(() => import("@/pages/AdminDashboardPage"));
const AdminUsersPage = lazy(() => import("@/pages/AdminUsersPage"));
const AdminUsersManagementPage = lazy(() => import("@/pages/FeatureArchivedPage"));
const AdminModerationPage = lazy(() => import("@/pages/AdminModerationPage"));
const ModerationDashboard = lazy(() => import("@/pages/admin/ModerationDashboard"));
const AnalyticsDashboard = HEAVY_FEATURES_ENABLED
  ? lazy(() => import("@/pages/admin/AnalyticsDashboard"))
  : FeatureDisabled;
const AdminFacebookImport = lazy(() => import("@/pages/FeatureArchivedPage"));
const AdminProjectTrackerPage = lazy(() => import("@/pages/FeatureArchivedPage"));
const AdminCompliancePage = lazy(() => import("@/pages/AdminCompliancePage"));
const AdminTranslationsPage = lazy(() => import("@/pages/AdminTranslationsPage"));
const AdminScrapingPage = lazy(() => import("@/pages/AdminScrapingPage"));
const AdminDashboardOverviewPage = lazy(() => import("@/pages/admin/AdminDashboardPage"));
const UserManagementPage = lazy(() => import("@/pages/admin/UserManagementPage"));
const PlatformSettingsPage = lazy(() => import("@/pages/admin/PlatformSettingsPage"));
const RolesPermissionsPage = lazy(() => import("@/pages/admin/RolesPermissionsPage"));
const ReportsLogsPage = lazy(() => import("@/pages/admin/ReportsLogsPage"));
const IntegrationsPage = lazy(() => import("@/pages/FeatureArchivedPage"));
const FeatureFlagsPage = lazy(() => import("@/pages/admin/FeatureFlagsPage"));
const SystemHealthPage = lazy(() => import("@/pages/FeatureArchivedPage"));
const AdminUserDetailPage = lazy(() => import("@/pages/admin/AdminUserDetailPage"));
const AdminIntegrationsPage = lazy(() => import("@/pages/FeatureArchivedPage"));
const AdminContentModerationDetailPage = lazy(() => import("@/pages/AdminContentModerationDetailPage"));
const AdminSettingsPage = lazy(() => import("@/pages/AdminSettingsPage"));
const AdminReportsPage = lazy(() => import("@/pages/AdminReportsPage"));
const DataQualityPage = lazy(() => import("@/pages/FeatureArchivedPage"));
const FeedbackManagementPage = lazy(() => import("@/pages/admin/FeedbackManagementPage"));

export function AdminRoutes() {
  return (
    <>
      <Route path="/admin">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <AdminDashboardPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/talent-pipeline">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <TalentPipelinePage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/volunteer/:id">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <VolunteerDetailsPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/task-board">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <TaskBoardPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/self-healing">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <SelfHealingPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/project-tracker">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <ProjectTrackerPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/user-reports">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <UserReportsPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/role-requests">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <RoleRequestsPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/event-approvals">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <EventApprovalsPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/events">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <AdminEventsPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/housing-reviews">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <HousingReviewsPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/agent-health">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <AgentHealthDashboard />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/ads-manager">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <AdsManager />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/feedback-queue">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeedbackQueuePage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/founder-approval">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeedbackQueuePage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/safety-review">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <SafetyReviewPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/ai-support">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <AISupportPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <AdminUsersPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/users-management">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <AdminUsersManagementPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/moderation">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <AdminModerationPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/moderation-dashboard">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <ModerationDashboard />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/analytics">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <AnalyticsDashboard />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/facebook-import">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <AdminFacebookImport />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/project">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <AdminProjectTrackerPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/compliance">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <AdminCompliancePage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/translations">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <AdminTranslationsPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/scraping">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <AdminScrapingPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/dashboard">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <AdminDashboardOverviewPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/user-management">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <UserManagementPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/platform-settings">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <PlatformSettingsPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/roles-permissions">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <RolesPermissionsPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/reports-logs">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <ReportsLogsPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/integrations">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <IntegrationsPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/feature-flags">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeatureFlagsPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/system-health">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <SystemHealthPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/user/:id">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <AdminUserDetailPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/integrations-config">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <AdminIntegrationsPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/content/:id">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <AdminContentModerationDetailPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/settings">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <AdminSettingsPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/reports">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <AdminReportsPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/data-quality">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <DataQualityPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/feedback">
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeedbackManagementPage />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      </Route>
    </>
  );
}
