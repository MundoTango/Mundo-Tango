import { lazy, Suspense } from "react";
import { Route } from "wouter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingFallback } from "@/components/LoadingFallback";

const EventsPage = lazy(() => import("@/pages/EventsPage"));
const EventSearchPage = lazy(() => import("@/pages/events/EventSearchPage"));
const EventDetailsPage = lazy(() => import("@/pages/EventDetailsPage"));
const EditEventPage = lazy(() => import("@/pages/EditEventPage"));
const MyEventsPage = lazy(() => import("@/pages/MyEventsPage"));
const EventSeriesPage = lazy(() => import("@/pages/EventSeriesPage"));
const EventCalendarPage = lazy(() => import("@/pages/EventCalendarPage"));
const EventCreationPage = lazy(() => import("@/pages/EventCreationPage"));
const EventDetailPage = lazy(() => import("@/pages/EventDetailPage"));
const EventCheckInPage = lazy(() => import("@/pages/EventCheckInPage"));
const CalendarPage = lazy(() => import("@/pages/CalendarPage"));
const TravelTripPlannerPage = lazy(() => import("@/pages/travel/TravelTripPlannerPage"));
const TravelItineraryPage = lazy(() => import("@/pages/travel/TravelItineraryPage"));
const TravelExpensesPage = lazy(() => import("@/pages/travel/TravelExpensesPage"));
const TravelEventCoordinationPage = lazy(() => import("@/pages/travel/TravelEventCoordinationPage"));
const TravelPlannerPage = lazy(() => import("@/pages/TravelPlannerPage"));

export function EventRoutes() {
  return (
    <>
      <Route path="/events">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <EventsPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/events/search">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <EventSearchPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/events/create">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <EventCreationPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/events/:id/edit">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <EditEventPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/events/:id/check-in">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <EventCheckInPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/events/:id">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <EventDetailsPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/my-events">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <MyEventsPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/event-series/:id">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <EventSeriesPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/calendar">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <CalendarPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/event-calendar">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <EventCalendarPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/travel">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <TravelPlannerPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/travel/planner">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <TravelTripPlannerPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/travel/trip/:id">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <TravelItineraryPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/travel/trip/:id/expenses">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <TravelExpensesPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/travel/events/:eventId">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <TravelEventCoordinationPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
    </>
  );
}
