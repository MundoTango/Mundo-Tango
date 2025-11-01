import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/AuthContext";
import { MrBlueProvider } from "./contexts/MrBlueContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/AppLayout";
import { GlobalTopbar } from "./components/GlobalTopbar";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { MrBlueWidget } from "./components/MrBlueWidget";
import { GlobalMrBlue } from "./components/mrblue/GlobalMrBlue";
import { ChatSidePanel } from "./components/mrblue/ChatSidePanel";
import { LoadingFallback } from "./components/LoadingFallback";

// Core Pages (loaded immediately for fast initial render)
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";

// Lazy-loaded pages for better performance
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const CalendarPage = lazy(() => import("@/pages/CalendarPage"));
// Social & Community
const DiscoverPage = lazy(() => import("@/pages/DiscoverPage"));
const VolunteerPage = lazy(() => import("@/pages/VolunteerPage"));
const FeedPage = lazy(() => import("@/pages/FeedPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const FriendsListPage = lazy(() => import("@/pages/FriendsListPage"));
const FollowingPage = lazy(() => import("@/pages/FollowingPage"));
const FollowersPage = lazy(() => import("@/pages/FollowersPage"));
const MessagesPage = lazy(() => import("@/pages/MessagesPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const SearchPage = lazy(() => import("@/pages/SearchPage"));

// Events & Groups
const EventsPage = lazy(() => import("@/pages/EventsPage"));
const EventDetailsPage = lazy(() => import("@/pages/EventDetailsPage"));
const GroupsPage = lazy(() => import("@/pages/GroupsPage"));
const GroupDetailsPage = lazy(() => import("@/pages/GroupDetailsPage"));

// Talent & AI
const TalentMatchPage = lazy(() => import("@/pages/TalentMatchPage"));
const MrBlueChatPage = lazy(() => import("@/pages/MrBlueChatPage"));
const VideoStudio = lazy(() => import("@/pages/VideoStudio"));
const MrBlueVideoDemo = lazy(() => import("@/pages/mr-blue-video-demo"));

// Life CEO Suite (16 agents)
const LifeCEODashboardPage = lazy(() => import("@/pages/LifeCEODashboardPage"));
const HealthAgentPage = lazy(() => import("@/pages/life-ceo/HealthAgentPage"));
const FinanceAgentPage = lazy(() => import("@/pages/life-ceo/FinanceAgentPage"));
const CareerAgentPage = lazy(() => import("@/pages/life-ceo/CareerAgentPage"));
const ProductivityAgentPage = lazy(() => import("@/pages/life-ceo/ProductivityAgentPage"));
const TravelAgentPage = lazy(() => import("@/pages/life-ceo/TravelAgentPage"));
const HomeManagementPage = lazy(() => import("@/pages/life-ceo/HomeManagementPage"));
const LearningAgentPage = lazy(() => import("@/pages/life-ceo/LearningAgentPage"));
const SocialAgentPage = lazy(() => import("@/pages/life-ceo/SocialAgentPage"));
const WellnessAgentPage = lazy(() => import("@/pages/life-ceo/WellnessAgentPage"));
const EntertainmentAgentPage = lazy(() => import("@/pages/life-ceo/EntertainmentAgentPage"));
const CreativityAgentPage = lazy(() => import("@/pages/life-ceo/CreativityAgentPage"));
const FitnessAgentPage = lazy(() => import("@/pages/life-ceo/FitnessAgentPage"));
const NutritionAgentPage = lazy(() => import("@/pages/life-ceo/NutritionAgentPage"));
const SleepAgentPage = lazy(() => import("@/pages/life-ceo/SleepAgentPage"));
const StressAgentPage = lazy(() => import("@/pages/life-ceo/StressAgentPage"));
const RelationshipAgentPage = lazy(() => import("@/pages/life-ceo/RelationshipAgentPage"));

// Admin & ESA Framework
const TalentPipelinePage = lazy(() => import("@/pages/admin/TalentPipelinePage"));
const TaskBoardPage = lazy(() => import("@/pages/admin/TaskBoardPage"));
const AdminDashboardPage = lazy(() => import("@/pages/AdminDashboardPage"));
const AdminUsersPage = lazy(() => import("@/pages/AdminUsersPage"));
const ContentModerationPage = lazy(() => import("@/pages/ContentModerationPage"));
const UserReportsPage = lazy(() => import("@/pages/UserReportsPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const PlatformPage = lazy(() => import("@/pages/Platform"));
const SecretsPage = lazy(() => import("@/pages/SecretsPage"));
const GitRepositoryPage = lazy(() => import("@/pages/GitRepositoryPage"));
const MonitoringPage = lazy(() => import("@/pages/MonitoringPage"));
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage"));
const ESADashboardPage = lazy(() => import("@/pages/ESADashboardPage"));
const AgentTasksPage = lazy(() => import("@/pages/AgentTasksPage"));
const AgentCommunicationsPage = lazy(() => import("@/pages/AgentCommunicationsPage"));

// Marketing & HR Agents
const SEOAgentPage = lazy(() => import("@/pages/marketing/SEOAgentPage"));
const ContentAgentPage = lazy(() => import("@/pages/marketing/ContentAgentPage"));
const SocialMediaAgentPage = lazy(() => import("@/pages/marketing/SocialMediaAgentPage"));
const EmailAgentPage = lazy(() => import("@/pages/marketing/EmailAgentPage"));
const AnalyticsAgentPage = lazy(() => import("@/pages/marketing/AnalyticsAgentPage"));
const RecruiterAgentPage = lazy(() => import("@/pages/hr/RecruiterAgentPage"));
const OnboardingAgentPage = lazy(() => import("@/pages/hr/OnboardingAgentPage"));
const PerformanceAgentPage = lazy(() => import("@/pages/hr/PerformanceAgentPage"));
const RetentionAgentPage = lazy(() => import("@/pages/hr/RetentionAgentPage"));
const CultureAgentPage = lazy(() => import("@/pages/hr/CultureAgentPage"));
const H2ACDashboardPage = lazy(() => import("@/pages/H2ACDashboardPage"));

// Settings & Account
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const UserSettingsPage = lazy(() => import("@/pages/UserSettingsPage"));
const EmailPreferencesPage = lazy(() => import("@/pages/EmailPreferencesPage"));
const NotificationSettingsPage = lazy(() => import("@/pages/NotificationSettingsPage"));
const PrivacySettingsPage = lazy(() => import("@/pages/PrivacySettingsPage"));
const AccountSettingsPage = lazy(() => import("@/pages/AccountSettingsPage"));
const ProfileEditPage = lazy(() => import("@/pages/ProfileEditPage"));
const ActivityLogPage = lazy(() => import("@/pages/ActivityLogPage"));
const SavedPostsPage = lazy(() => import("@/pages/SavedPostsPage"));
const BlockedUsersPage = lazy(() => import("@/pages/BlockedUsersPage"));
const BlockedContentPage = lazy(() => import("@/pages/BlockedContentPage"));

// Auth & Security
const PasswordResetPage = lazy(() => import("@/pages/PasswordResetPage"));
const EmailVerificationPage = lazy(() => import("@/pages/EmailVerificationPage"));
const TwoFactorAuthPage = lazy(() => import("@/pages/TwoFactorAuthPage"));

// Tango Resources
const TeachersPage = lazy(() => import("@/pages/TeachersPage"));
const TeacherDetailPage = lazy(() => import("@/pages/TeacherDetailPage"));
const VenuesPage = lazy(() => import("@/pages/VenuesPage"));
const VenueDetailPage = lazy(() => import("@/pages/VenueDetailPage"));
const TutorialsPage = lazy(() => import("@/pages/TutorialsPage"));
const TutorialDetailPage = lazy(() => import("@/pages/TutorialDetailPage"));
const WorkshopsPage = lazy(() => import("@/pages/WorkshopsPage"));
const WorkshopDetailPage = lazy(() => import("@/pages/WorkshopDetailPage"));
const VideoLessonsPage = lazy(() => import("@/pages/VideoLessonsPage"));
const DanceStylesPage = lazy(() => import("@/pages/DanceStylesPage"));
const PartnerFinderPage = lazy(() => import("@/pages/PartnerFinderPage"));
const MusicLibraryPage = lazy(() => import("@/pages/MusicLibraryPage"));

// Travel & Housing
const TravelPlannerPage = lazy(() => import("@/pages/TravelPlannerPage"));
const HostHomesPage = lazy(() => import("@/pages/HostHomesPage"));

// Commerce
const MarketplacePage = lazy(() => import("@/pages/MarketplacePage"));
const MarketplaceItemPage = lazy(() => import("@/pages/MarketplaceItemPage"));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"));
const BillingPage = lazy(() => import("@/pages/BillingPage"));
const PaymentSuccessPage = lazy(() => import("@/pages/PaymentSuccessPage"));
const PaymentFailedPage = lazy(() => import("@/pages/PaymentFailedPage"));
const BookingConfirmationPage = lazy(() => import("@/pages/BookingConfirmationPage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));

// Content & Info
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const NewsletterPage = lazy(() => import("@/pages/NewsletterPage"));
const LiveStreamPage = lazy(() => import("@/pages/LiveStreamPage"));
const ReviewsPage = lazy(() => import("@/pages/ReviewsPage"));
const MediaGalleryPage = lazy(() => import("@/pages/MediaGalleryPage"));
const LeaderboardPage = lazy(() => import("@/pages/LeaderboardPage"));
const FAQPage = lazy(() => import("@/pages/FAQPage"));
const HelpPage = lazy(() => import("@/pages/HelpPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const PrivacyPolicyPage = lazy(() => import("@/pages/PrivacyPolicyPage"));
const CommunityGuidelinesPage = lazy(() => import("@/pages/CommunityGuidelinesPage"));

// Onboarding
const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));
const WelcomeTourPage = lazy(() => import("@/pages/WelcomeTourPage"));
const WelcomePage = lazy(() => import("@/pages/onboarding/WelcomePage"));
const CitySelectionPage = lazy(() => import("@/pages/onboarding/CitySelectionPage"));
const PhotoUploadPage = lazy(() => import("@/pages/onboarding/PhotoUploadPage"));
const TangoRolesPage = lazy(() => import("@/pages/onboarding/TangoRolesPage"));
const GuidedTourPage = lazy(() => import("@/pages/onboarding/GuidedTourPage"));

// Moderation & Reports
const ReportUserPage = lazy(() => import("@/pages/ReportUserPage"));
const ReportContentPage = lazy(() => import("@/pages/ReportContentPage"));

// Visual Editor
const VisualEditorPage = lazy(() => import("@/pages/VisualEditorPage"));

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/discover" component={DiscoverPage} />
      <Route path="/volunteer" component={VolunteerPage} />
      <Route path="/talent-match" component={TalentMatchPage} />
      <Route path="/mr-blue-chat" component={MrBlueChatPage} />
      <Route path="/video-studio" component={VideoStudio} />
      <Route path="/mr-blue-demo" component={MrBlueVideoDemo} />
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

      <Route path="/dance-styles" component={DanceStylesPage} />

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

      <Route path="/marketing/seo" component={SEOAgentPage} />
      <Route path="/marketing/content" component={ContentAgentPage} />
      <Route path="/marketing/social-media" component={SocialMediaAgentPage} />
      <Route path="/marketing/email" component={EmailAgentPage} />
      <Route path="/marketing/analytics" component={AnalyticsAgentPage} />
      
      <Route path="/hr/recruiter" component={RecruiterAgentPage} />
      <Route path="/hr/onboarding" component={OnboardingAgentPage} />
      <Route path="/hr/performance" component={PerformanceAgentPage} />
      <Route path="/hr/retention" component={RetentionAgentPage} />
      <Route path="/hr/culture" component={CultureAgentPage} />
      
      <Route path="/h2ac-dashboard" component={H2ACDashboardPage} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MrBlueProvider>
            <TooltipProvider>
              <Toaster />
              <Suspense fallback={<LoadingFallback />}>
                <Router />
              </Suspense>
              <GlobalMrBlue />
              <ChatSidePanel />
            </TooltipProvider>
          </MrBlueProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
