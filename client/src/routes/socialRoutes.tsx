import { lazy, Suspense } from "react";
import { Route } from "wouter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import { LoadingFallback } from "@/components/LoadingFallback";

const FeedPage = lazy(() => import("@/pages/FeedPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const ScrapedProfilePage = lazy(() => import("@/pages/ScrapedProfilePage"));
const ProfileEditPage = lazy(() => import("@/pages/ProfileEditPage"));
const FriendsListPage = lazy(() => import("@/pages/FriendsListPage"));
const FriendshipPage = lazy(() => import("@/pages/FriendshipPage"));
const FriendRequestsPage = lazy(() => import("@/pages/FriendRequestsPage"));
const FriendDetailPage = lazy(() => import("@/pages/FriendDetailPage"));
const FollowingPage = lazy(() => import("@/pages/FollowingPage"));
const FollowersPage = lazy(() => import("@/pages/FollowersPage"));
const MessagesPage = lazy(() => import("@/pages/MessagesPage"));
const CreatePostPage = lazy(() => import("@/pages/CreatePostPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const SearchPage = lazy(() => import("@/pages/SearchPage"));
const ReputationProfile = lazy(() => import("@/pages/ReputationProfile"));
const FavoritesPage = lazy(() => import("@/pages/FavoritesPage"));
const SavedPostsPage = lazy(() => import("@/pages/SavedPostsPage"));
const StoriesPage = lazy(() => import("@/pages/StoriesPage"));
const LiveStreamPage = lazy(() => import("@/pages/LiveStreamPage"));
const InvitationsPage = lazy(() => import("@/pages/InvitationsPage"));
const FacebookInvites = lazy(() => import("@/pages/FacebookInvites"));
const FacebookTestWorkflow = lazy(() => import("@/pages/FacebookTestWorkflow"));
const FacebookDataImport = lazy(() => import("@/pages/FacebookDataImport"));
const ClosenessMetrics = lazy(() => import("@/pages/ClosenessMetrics"));
const RecommendationsPage = lazy(() => import("@/pages/RecommendationsPage"));
const CommunityWorldMapPage = lazy(() => import("@/pages/CommunityWorldMapPage"));
const UnifiedInboxPage = lazy(() => import("@/pages/messages/UnifiedInbox"));
const ChannelConnectionsPage = lazy(() => import("@/pages/messages/ChannelConnections"));
const MessageTemplatesPage = lazy(() => import("@/pages/messages/Templates"));
const MessageAutomationsPage = lazy(() => import("@/pages/messages/Automations"));
const DirectMessagesPage = lazy(() => import("@/pages/messages/DirectMessages"));
const GroupChatPage = lazy(() => import("@/pages/messages/GroupChat"));
const MessageThreadsPage = lazy(() => import("@/pages/messages/MessageThreads"));
const MessagesDetailPage = lazy(() => import("@/pages/MessagesDetailPage"));
const GroupsPage = lazy(() => import("@/pages/GroupsPage"));
const GroupCreatePage = lazy(() => import("@/pages/GroupCreatePage"));
const GroupDetailsPage = lazy(() => import("@/pages/GroupDetailsPage"));
const GroupsDetailPage = lazy(() => import("@/pages/GroupsDetailPage"));
const CityGroupsPage = lazy(() => import("@/pages/CityGroupsPage"));
const CityGroupRedirectPage = lazy(() => import("@/pages/CityGroupRedirectPage"));
const CityHubPage = lazy(() => import("@/pages/CityHubPage"));
const CitySlugRedirectPage = lazy(() => import("@/pages/CitySlugRedirectPage"));
const CityDetailsPage = lazy(() => import("@/pages/CityDetailsPage"));
const ProfessionalGroupsPage = lazy(() => import("@/pages/ProfessionalGroupsPage"));
const CustomGroupsPage = lazy(() => import("@/pages/CustomGroupsPage"));
const CommunityMapPage = lazy(() => import("@/pages/CommunityMapPage"));
const ReportUserPage = lazy(() => import("@/pages/ReportUserPage"));
const ReportContentPage = lazy(() => import("@/pages/ReportContentPage"));
const GamificationDashboard = lazy(() => import("@/pages/GamificationDashboard"));
const LeaderboardPage = lazy(() => import("@/pages/LeaderboardPage"));
const ClosenessMetricsDashboardPage = lazy(() => import("@/pages/ClosenessMetricsDashboardPage"));
const ProfessionalReputationPage = lazy(() => import("@/pages/ProfessionalReputationPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const HomePage = lazy(() => import("@/pages/HomePage"));

export function SocialRoutes() {
  return (
    <>
      <Route path="/">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/feed">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FeedPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/home">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <HomePage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <ProfilePage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/profile/edit">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <ProfileEditPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/profile/scraped/:id">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <ScrapedProfilePage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/profile/:id">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <ProfilePage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/reputation/:userId">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <ReputationProfile />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/friends">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FriendsListPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/friendship">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FriendshipPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/friend-requests">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FriendRequestsPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/friends/:id">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FriendDetailPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/following">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FollowingPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/followers">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FollowersPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/messages">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <MessagesPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/messages/inbox">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <UnifiedInboxPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/messages/channels">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <ChannelConnectionsPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/messages/templates">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <MessageTemplatesPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/messages/automations">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <MessageAutomationsPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/messages/direct">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <DirectMessagesPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/messages/group">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <GroupChatPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/messages/threads">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <MessageThreadsPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/messages/:id">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <MessagesDetailPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/create-post">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <CreatePostPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/notifications">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <NotificationsPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/search">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <SearchPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/favorites">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FavoritesPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/saved">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <SavedPostsPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/stories">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <StoriesPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/live">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <LiveStreamPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/invitations">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <InvitationsPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/facebook-invites">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FacebookInvites />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/facebook-test-workflow">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FacebookTestWorkflow />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/facebook-data-import">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FacebookDataImport />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/closeness-metrics">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <ClosenessMetrics />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/recommendations">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <RecommendationsPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/community-world-map">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <CommunityWorldMapPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/community-map">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <CommunityWorldMapPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/world-map">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <CommunityWorldMapPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/map">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <CommunityMapPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/groups">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <GroupsPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/groups/create">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <GroupCreatePage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/groups/cities">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <CityGroupsPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/groups/professional">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <ProfessionalGroupsPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/groups/custom">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <CustomGroupsPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/groups/city/:cityName">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <CityGroupRedirectPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/groups/:id">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <GroupDetailsPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/city-groups">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <CityGroupsPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/city/:citySlug">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <CitySlugRedirectPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/cities/:cityName">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <CityDetailsPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/report/user/:id">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <ReportUserPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/report/content/:id">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <ReportContentPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/gamification">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <GamificationDashboard />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/leaderboard">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <LeaderboardPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/closeness-dashboard">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <ClosenessMetricsDashboardPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/professional-reputation">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <ProfessionalReputationPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
    </>
  );
}
