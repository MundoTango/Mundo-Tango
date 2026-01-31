import { lazy, Suspense } from "react";
import { Route } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingFallback } from "@/components/LoadingFallback";

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

export function LifeCeoRoutes() {
  return (
    <>
      <Route path="/life-ceo">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <LifeCEODashboardPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/life-ceo/health">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <HealthAgentPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/life-ceo/finance">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <FinanceAgentPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/life-ceo/career">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <CareerAgentPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/life-ceo/productivity">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <ProductivityAgentPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/life-ceo/travel">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <TravelAgentPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/life-ceo/home">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <HomeManagementPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/life-ceo/learning">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <LearningAgentPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/life-ceo/social">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <SocialAgentPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/life-ceo/wellness">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <WellnessAgentPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/life-ceo/entertainment">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <EntertainmentAgentPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/life-ceo/creativity">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <CreativityAgentPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/life-ceo/fitness">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <FitnessAgentPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/life-ceo/nutrition">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <NutritionAgentPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/life-ceo/sleep">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <SleepAgentPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/life-ceo/stress">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <StressAgentPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/life-ceo/relationship">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <RelationshipAgentPage />
          </Suspense>
        </AppLayout>
      </Route>
    </>
  );
}
