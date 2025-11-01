import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/AppLayout";
import { GlobalTopbar } from "./components/GlobalTopbar";
import { ErrorBoundary } from "./components/ErrorBoundary";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import CalendarPage from "@/pages/CalendarPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DiscoverPage from "@/pages/DiscoverPage";
import VolunteerPage from "@/pages/VolunteerPage";
import TalentMatchPage from "@/pages/TalentMatchPage";
import MrBlueChatPage from "@/pages/MrBlueChatPage";
import LifeCEODashboardPage from "@/pages/LifeCEODashboardPage";
import HealthAgentPage from "@/pages/life-ceo/HealthAgentPage";
import FinanceAgentPage from "@/pages/life-ceo/FinanceAgentPage";
import CareerAgentPage from "@/pages/life-ceo/CareerAgentPage";
import ProductivityAgentPage from "@/pages/life-ceo/ProductivityAgentPage";
import TravelAgentPage from "@/pages/life-ceo/TravelAgentPage";
import HomeManagementPage from "@/pages/life-ceo/HomeManagementPage";
import LearningAgentPage from "@/pages/life-ceo/LearningAgentPage";
import SocialAgentPage from "@/pages/life-ceo/SocialAgentPage";
import WellnessAgentPage from "@/pages/life-ceo/WellnessAgentPage";
import EntertainmentAgentPage from "@/pages/life-ceo/EntertainmentAgentPage";
import CreativityAgentPage from "@/pages/life-ceo/CreativityAgentPage";
import FitnessAgentPage from "@/pages/life-ceo/FitnessAgentPage";
import NutritionAgentPage from "@/pages/life-ceo/NutritionAgentPage";
import SleepAgentPage from "@/pages/life-ceo/SleepAgentPage";
import StressAgentPage from "@/pages/life-ceo/StressAgentPage";
import RelationshipAgentPage from "@/pages/life-ceo/RelationshipAgentPage";
import TalentPipelinePage from "@/pages/admin/TalentPipelinePage";
import TaskBoardPage from "@/pages/admin/TaskBoardPage";
import FeedPage from "@/pages/FeedPage";
import ProfilePage from "@/pages/ProfilePage";
import EventsPage from "@/pages/EventsPage";
import EventDetailsPage from "@/pages/EventDetailsPage";
import GroupsPage from "@/pages/GroupsPage";
import GroupDetailsPage from "@/pages/GroupDetailsPage";
import MessagesPage from "@/pages/MessagesPage";
import SettingsPage from "@/pages/SettingsPage";
import PlatformPage from "@/pages/Platform";
import SecretsPage from "@/pages/SecretsPage";
import GitRepositoryPage from "@/pages/GitRepositoryPage";
import MonitoringPage from "@/pages/MonitoringPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import ESADashboardPage from "@/pages/ESADashboardPage";
import AgentTasksPage from "@/pages/AgentTasksPage";
import AgentCommunicationsPage from "@/pages/AgentCommunicationsPage";
import FriendsListPage from "@/pages/FriendsListPage";
import NotificationsPage from "@/pages/NotificationsPage";
import SearchPage from "@/pages/SearchPage";
import UserSettingsPage from "@/pages/UserSettingsPage";
import TeachersPage from "@/pages/TeachersPage";
import VenuesPage from "@/pages/VenuesPage";
import TutorialsPage from "@/pages/TutorialsPage";
import MarketplacePage from "@/pages/MarketplacePage";
import FAQPage from "@/pages/FAQPage";
import DanceStylesPage from "@/pages/DanceStylesPage";
import PartnerFinderPage from "@/pages/PartnerFinderPage";
import VideoLessonsPage from "@/pages/VideoLessonsPage";
import HostHomesPage from "@/pages/HostHomesPage";
import TravelPlannerPage from "@/pages/TravelPlannerPage";
import BlogPage from "@/pages/BlogPage";
import MusicLibraryPage from "@/pages/MusicLibraryPage";
import CommunityGuidelinesPage from "@/pages/CommunityGuidelinesPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsPage from "@/pages/TermsPage";
import ContactPage from "@/pages/ContactPage";
import PricingPage from "@/pages/PricingPage";
import CheckoutPage from "@/pages/CheckoutPage";
import BillingPage from "@/pages/BillingPage";
import OnboardingPage from "@/pages/OnboardingPage";
import WelcomeTourPage from "@/pages/WelcomeTourPage";
import WelcomePage from "@/pages/onboarding/WelcomePage";
import CitySelectionPage from "@/pages/onboarding/CitySelectionPage";
import PhotoUploadPage from "@/pages/onboarding/PhotoUploadPage";
import TangoRolesPage from "@/pages/onboarding/TangoRolesPage";
import GuidedTourPage from "@/pages/onboarding/GuidedTourPage";
import LiveStreamPage from "@/pages/LiveStreamPage";
import WorkshopsPage from "@/pages/WorkshopsPage";
import ReviewsPage from "@/pages/ReviewsPage";
import MediaGalleryPage from "@/pages/MediaGalleryPage";
import LeaderboardPage from "@/pages/LeaderboardPage";
import NewsletterPage from "@/pages/NewsletterPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import ContentModerationPage from "@/pages/ContentModerationPage";
import UserReportsPage from "@/pages/UserReportsPage";
import SavedPostsPage from "@/pages/SavedPostsPage";
import BlockedUsersPage from "@/pages/BlockedUsersPage";
import HelpPage from "@/pages/HelpPage";
import WorkshopDetailPage from "@/pages/WorkshopDetailPage";
import TeacherDetailPage from "@/pages/TeacherDetailPage";
import VenueDetailPage from "@/pages/VenueDetailPage";
import TutorialDetailPage from "@/pages/TutorialDetailPage";
import MarketplaceItemPage from "@/pages/MarketplaceItemPage";
import BookingConfirmationPage from "@/pages/BookingConfirmationPage";
import PaymentSuccessPage from "@/pages/PaymentSuccessPage";
import PaymentFailedPage from "@/pages/PaymentFailedPage";
import EmailPreferencesPage from "@/pages/EmailPreferencesPage";
import NotificationSettingsPage from "@/pages/NotificationSettingsPage";
import PrivacySettingsPage from "@/pages/PrivacySettingsPage";
import AccountSettingsPage from "@/pages/AccountSettingsPage";
import PasswordResetPage from "@/pages/PasswordResetPage";
import EmailVerificationPage from "@/pages/EmailVerificationPage";
import TwoFactorAuthPage from "@/pages/TwoFactorAuthPage";
import ProfileEditPage from "@/pages/ProfileEditPage";
import ActivityLogPage from "@/pages/ActivityLogPage";
import FollowingPage from "@/pages/FollowingPage";
import FollowersPage from "@/pages/FollowersPage";
import BlockedContentPage from "@/pages/BlockedContentPage";
import ReportUserPage from "@/pages/ReportUserPage";
import ReportContentPage from "@/pages/ReportContentPage";
import AdminUsersPage from "@/pages/AdminUsersPage";
import DashboardPage from "@/pages/DashboardPage";
import VisualEditorPage from "@/pages/VisualEditorPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/discover" component={DiscoverPage} />
      <Route path="/volunteer" component={VolunteerPage} />
      <Route path="/talent-match" component={TalentMatchPage} />
      <Route path="/mr-blue-chat" component={MrBlueChatPage} />
      <Route path="/life-ceo" component={LifeCEODashboardPage} />
      <Route path="/life-ceo/health" component={HealthAgentPage} />
      <Route path="/life-ceo/finance" component={FinanceAgentPage} />
      <Route path="/life-ceo/career" component={CareerAgentPage} />
      <Route path="/life-ceo/productivity" component={ProductivityAgentPage} />
      <Route path="/life-ceo/travel" component={TravelAgentPage} />
      <Route path="/life-ceo/home" component={HomeManagementPage} />
      <Route path="/life-ceo/learning" component={LearningAgentPage} />
      <Route path="/life-ceo/social" component={SocialAgentPage} />
      <Route path="/life-ceo/wellness" component={WellnessAgentPage} />
      <Route path="/life-ceo/entertainment" component={EntertainmentAgentPage} />
      <Route path="/life-ceo/creativity" component={CreativityAgentPage} />
      <Route path="/life-ceo/fitness" component={FitnessAgentPage} />
      <Route path="/life-ceo/nutrition" component={NutritionAgentPage} />
      <Route path="/life-ceo/sleep" component={SleepAgentPage} />
      <Route path="/life-ceo/stress" component={StressAgentPage} />
      <Route path="/life-ceo/relationship" component={RelationshipAgentPage} />
      <Route path="/admin/talent-pipeline" component={TalentPipelinePage} />
      <Route path="/admin/task-board" component={TaskBoardPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      
      <Route path="/feed">
        <ProtectedRoute>
          <FeedPage />
        </ProtectedRoute>
      </Route>

      <Route path="/profile">
        <ProtectedRoute>
          <AppLayout>
            <ProfilePage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/profile/:id">
        <ProtectedRoute>
          <AppLayout>
            <ProfilePage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/events">
        <ProtectedRoute>
          <AppLayout>
            <EventsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/events/:id">
        <ProtectedRoute>
          <AppLayout>
            <EventDetailsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/groups">
        <ProtectedRoute>
          <AppLayout>
            <GroupsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/groups/:id">
        <ProtectedRoute>
          <AppLayout>
            <GroupDetailsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/messages">
        <ProtectedRoute>
          <AppLayout>
            <MessagesPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/settings">
        <ProtectedRoute>
          <AppLayout>
            <UserSettingsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/calendar">
        <ProtectedRoute>
          <AppLayout>
            <CalendarPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/friends">
        <ProtectedRoute>
          <AppLayout>
            <FriendsListPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/notifications">
        <ProtectedRoute>
          <AppLayout>
            <NotificationsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/search">
        <ProtectedRoute>
          <AppLayout>
            <SearchPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/teachers">
        <ProtectedRoute>
          <AppLayout>
            <TeachersPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/venues">
        <ProtectedRoute>
          <AppLayout>
            <VenuesPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/tutorials">
        <ProtectedRoute>
          <AppLayout>
            <TutorialsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/marketplace">
        <ProtectedRoute>
          <AppLayout>
            <MarketplacePage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/faq" component={FAQPage} />

      <Route path="/dance-styles">
        <ProtectedRoute>
          <AppLayout>
            <DanceStylesPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/partner-finder">
        <ProtectedRoute>
          <AppLayout>
            <PartnerFinderPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/platform">
        <ProtectedRoute>
          <AppLayout>
            <PlatformPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/platform/secrets">
        <ProtectedRoute>
          <AppLayout>
            <SecretsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/platform/git">
        <ProtectedRoute>
          <AppLayout>
            <GitRepositoryPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/platform/monitoring">
        <ProtectedRoute>
          <AppLayout>
            <MonitoringPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/platform/analytics">
        <ProtectedRoute>
          <AppLayout>
            <AnalyticsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/platform/esa">
        <ProtectedRoute>
          <AppLayout>
            <ESADashboardPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/platform/esa/tasks">
        <ProtectedRoute>
          <AppLayout>
            <AgentTasksPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/platform/esa/communications">
        <ProtectedRoute>
          <AppLayout>
            <AgentCommunicationsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/video-lessons" component={VideoLessonsPage} />
      <Route path="/video-lessons/:id" component={TutorialDetailPage} />
      <Route path="/host-homes" component={HostHomesPage} />
      <Route path="/travel-planner" component={TravelPlannerPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogPage} />
      <Route path="/music" component={MusicLibraryPage} />
      <Route path="/community-guidelines" component={CommunityGuidelinesPage} />
      <Route path="/privacy" component={PrivacyPolicyPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/pricing" component={PricingPage} />
      
      <Route path="/checkout">
        <ProtectedRoute>
          <CheckoutPage />
        </ProtectedRoute>
      </Route>

      <Route path="/billing">
        <ProtectedRoute>
          <AppLayout>
            <BillingPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/onboarding/welcome" component={WelcomePage} />
      <Route path="/onboarding/step-1" component={CitySelectionPage} />
      <Route path="/onboarding/step-2" component={PhotoUploadPage} />
      <Route path="/onboarding/step-3" component={TangoRolesPage} />
      <Route path="/onboarding/step-4" component={GuidedTourPage} />
      <Route path="/welcome" component={WelcomeTourPage} />
      
      <Route path="/live-streams">
        <ProtectedRoute>
          <AppLayout>
            <LiveStreamPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/workshops">
        <ProtectedRoute>
          <AppLayout>
            <WorkshopsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/workshops/:id" component={WorkshopDetailPage} />
      
      <Route path="/reviews">
        <ProtectedRoute>
          <AppLayout>
            <ReviewsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/gallery">
        <ProtectedRoute>
          <AppLayout>
            <MediaGalleryPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/leaderboard">
        <ProtectedRoute>
          <AppLayout>
            <LeaderboardPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/newsletter" component={NewsletterPage} />
      
      <Route path="/admin/dashboard">
        <ProtectedRoute>
          <AppLayout>
            <AdminDashboardPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/moderation">
        <ProtectedRoute>
          <AppLayout>
            <ContentModerationPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/reports">
        <ProtectedRoute>
          <AppLayout>
            <UserReportsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/users">
        <ProtectedRoute>
          <AppLayout>
            <AdminUsersPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/saved">
        <ProtectedRoute>
          <AppLayout>
            <SavedPostsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/blocked-users">
        <ProtectedRoute>
          <AppLayout>
            <BlockedUsersPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/blocked-content">
        <ProtectedRoute>
          <AppLayout>
            <BlockedContentPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/help" component={HelpPage} />
      <Route path="/teachers/:id" component={TeacherDetailPage} />
      <Route path="/venues/:id" component={VenueDetailPage} />
      <Route path="/tutorials/:id" component={TutorialDetailPage} />
      <Route path="/marketplace/:id" component={MarketplaceItemPage} />
      <Route path="/booking/confirmation" component={BookingConfirmationPage} />
      <Route path="/payment/success" component={PaymentSuccessPage} />
      <Route path="/payment/failed" component={PaymentFailedPage} />
      
      <Route path="/settings/email">
        <ProtectedRoute>
          <AppLayout>
            <EmailPreferencesPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/settings/notifications">
        <ProtectedRoute>
          <AppLayout>
            <NotificationSettingsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/settings/privacy">
        <ProtectedRoute>
          <AppLayout>
            <PrivacySettingsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/settings/account">
        <ProtectedRoute>
          <AppLayout>
            <AccountSettingsPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/password-reset" component={PasswordResetPage} />
      <Route path="/verify-email" component={EmailVerificationPage} />
      
      <Route path="/settings/2fa">
        <ProtectedRoute>
          <AppLayout>
            <TwoFactorAuthPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/profile/edit">
        <ProtectedRoute>
          <AppLayout>
            <ProfileEditPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/activity">
        <ProtectedRoute>
          <AppLayout>
            <ActivityLogPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/following">
        <ProtectedRoute>
          <AppLayout>
            <FollowingPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/followers">
        <ProtectedRoute>
          <AppLayout>
            <FollowersPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/report/user" component={ReportUserPage} />
      <Route path="/report/content" component={ReportContentPage} />
      
      <Route path="/dashboard">
        <ProtectedRoute>
          <AppLayout>
            <DashboardPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/visual-editor">
        <ProtectedRoute>
          <AppLayout>
            <VisualEditorPage />
          </AppLayout>
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
