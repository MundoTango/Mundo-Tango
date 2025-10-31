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

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      
      <Route path="/">
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
