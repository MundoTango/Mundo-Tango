import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/AppLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import CalendarPage from "@/pages/CalendarPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
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
import FriendsPage from "@/pages/FriendsPage";
import NotificationsPage from "@/pages/NotificationsPage";
import SearchPage from "@/pages/SearchPage";
import TeachersPage from "@/pages/TeachersPage";
import VenuesPage from "@/pages/VenuesPage";
import TutorialsPage from "@/pages/TutorialsPage";
import MarketplacePage from "@/pages/MarketplacePage";
import FAQPage from "@/pages/FAQPage";
import DanceStylesPage from "@/pages/DanceStylesPage";
import PartnerFinderPage from "@/pages/PartnerFinderPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      
      <Route path="/feed">
        <ProtectedRoute>
          <AppLayout>
            <FeedPage />
          </AppLayout>
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
            <SettingsPage />
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
            <FriendsPage />
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
