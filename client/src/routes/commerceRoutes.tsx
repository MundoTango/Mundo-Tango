import { lazy, Suspense } from "react";
import { Route } from "wouter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import { LoadingFallback } from "@/components/LoadingFallback";

const MarketplacePage = lazy(() => import("@/pages/MarketplacePage"));
const MarketplaceItemPage = lazy(() => import("@/pages/MarketplaceItemPage"));
const MarketplaceProductDetailPage = lazy(() => import("@/pages/MarketplaceProductDetailPage"));
const MarketplaceCartPage = lazy(() => import("@/pages/MarketplaceCartPage"));
const MarketplaceCheckoutPage = lazy(() => import("@/pages/MarketplaceCheckoutPage"));
const MarketplaceSellerDashboardPage = lazy(() => import("@/pages/MarketplaceSellerDashboardPage"));
const MarketplaceOrdersPage = lazy(() => import("@/pages/MarketplaceOrdersPage"));
const MarketplaceItemDetailPage = lazy(() => import("@/pages/MarketplaceItemDetailPage"));
const BillingPage = lazy(() => import("@/pages/BillingPage"));
const PaymentSuccessPage = lazy(() => import("@/pages/PaymentSuccessPage"));
const PaymentFailedPage = lazy(() => import("@/pages/PaymentFailedPage"));
const BookingConfirmationPage = lazy(() => import("@/pages/BookingConfirmationPage"));
const SubscriptionsPage = lazy(() => import("@/pages/SubscriptionsPage"));
const ManageSubscriptionPage = lazy(() => import("@/pages/ManageSubscriptionPage"));
const CheckoutPage = lazy(() => import("@/pages/Checkout"));
const CheckoutSuccessPage = lazy(() => import("@/pages/CheckoutSuccessPage"));
const SubscriptionPlansPage = lazy(() => import("@/pages/SubscriptionPlans"));
const PaymentIntegrationPage = lazy(() => import("@/pages/PaymentIntegration"));
const BillingHistoryPage = lazy(() => import("@/pages/BillingHistory"));
const InvoiceManagementPage = lazy(() => import("@/pages/InvoiceManagement"));
const CrowdfundingDashboardPage = lazy(() => import("@/pages/crowdfunding/CrowdfundingDashboardPage"));
const CrowdfundingCampaignDetailPage = lazy(() => import("@/pages/crowdfunding/CrowdfundingCampaignDetailPage"));
const CrowdfundingCreatePage = lazy(() => import("@/pages/crowdfunding/CrowdfundingCreatePage"));
const CrowdfundingMyPage = lazy(() => import("@/pages/crowdfunding/CrowdfundingMyPage"));
const FinancialDashboardPage = lazy(() => import("@/pages/FinancialDashboardPage"));
const FinancialPortfoliosPage = lazy(() => import("@/pages/FinancialPortfoliosPage"));
const FinancialAccountsPage = lazy(() => import("@/pages/FinancialAccountsPage"));
const FinancialTradingPage = lazy(() => import("@/pages/FinancialTradingPage"));
const FinancialInsightsPage = lazy(() => import("@/pages/FinancialInsightsPage"));

export function CommerceRoutes() {
  return (
    <>
      <Route path="/marketplace">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <MarketplacePage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/marketplace/item/:id">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <MarketplaceItemPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/marketplace/product/:id">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <MarketplaceProductDetailPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/marketplace/cart">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <MarketplaceCartPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/marketplace/checkout">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <MarketplaceCheckoutPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/marketplace/seller">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <MarketplaceSellerDashboardPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/marketplace/orders">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <MarketplaceOrdersPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/marketplace/detail/:id">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <MarketplaceItemDetailPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/billing">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <BillingPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/payment/success">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <PaymentSuccessPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/payment/failed">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <PaymentFailedPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/booking/confirmation">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <BookingConfirmationPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/subscriptions">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <SubscriptionsPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/subscription/manage">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <ManageSubscriptionPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/checkout">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <CheckoutPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/checkout/success">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <CheckoutSuccessPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/subscription-plans">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <SubscriptionPlansPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/payment-integration">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <PaymentIntegrationPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/billing-history">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <BillingHistoryPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/invoices">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <InvoiceManagementPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/crowdfunding">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <CrowdfundingDashboardPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/crowdfunding/campaign/:id">
        <AppLayout>
          <Suspense fallback={<LoadingFallback />}>
            <CrowdfundingCampaignDetailPage />
          </Suspense>
        </AppLayout>
      </Route>
      <Route path="/crowdfunding/create">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <CrowdfundingCreatePage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/crowdfunding/my">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <CrowdfundingMyPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/financial">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FinancialDashboardPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/financial/portfolios">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FinancialPortfoliosPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/financial/accounts">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FinancialAccountsPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/financial/trading">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FinancialTradingPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/financial/insights">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <FinancialInsightsPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
    </>
  );
}
