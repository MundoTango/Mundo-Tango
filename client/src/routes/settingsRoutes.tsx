import { lazy, Suspense } from "react";
import { Route } from "wouter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingFallback } from "@/components/LoadingFallback";

const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const UserSettingsPage = lazy(() => import("@/pages/UserSettingsPage"));
const EmailPreferencesPage = lazy(() => import("@/pages/settings/EmailPreferences"));
const NotificationSettingsPage = lazy(() => import("@/pages/NotificationSettingsPage"));
const NotificationPreferencesPage = lazy(() => import("@/pages/NotificationPreferencesPage"));
const PrivacySettingsPage = lazy(() => import("@/pages/PrivacySettings"));
const AccountSettingsPage = lazy(() => import("@/pages/AccountSettingsPage"));
const ProfileEditPage = lazy(() => import("@/pages/ProfileEditPage"));
const ActivityLogPage = lazy(() => import("@/pages/ActivityLogPage"));
const BlockedUsersPage = lazy(() => import("@/pages/BlockedUsersPage"));
const BlockedContentPage = lazy(() => import("@/pages/BlockedContentPage"));
const BillingDashboard = lazy(() => import("@/pages/settings/BillingDashboard"));
const PaymentHistory = lazy(() => import("@/pages/settings/PaymentHistory"));
const PaymentMethods = lazy(() => import("@/pages/settings/PaymentMethods"));
const SecuritySettingsPage = lazy(() => import("@/pages/settings/SecuritySettingsPage"));
const PrivacyPage = lazy(() => import("@/pages/settings/PrivacyPage"));
const DataExportPage = lazy(() => import("@/pages/DataExport"));
const DeleteAccountPage = lazy(() => import("@/pages/AccountDeletion"));
const SecuritySettings = lazy(() => import("@/pages/SecuritySettings"));
const TwoFactorSetup = lazy(() => import("@/pages/TwoFactorSetup"));
const TwoFactorVerify = lazy(() => import("@/pages/TwoFactorVerify"));
const LegalStatus = lazy(() => import("@/pages/settings/LegalStatus"));

export function SettingsRoutes() {
  return (
    <>
      <Route path="/settings">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <SettingsPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings/user">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <UserSettingsPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings/email-preferences">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <EmailPreferencesPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings/notifications">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <NotificationSettingsPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings/notification-preferences">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <NotificationPreferencesPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings/privacy">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <PrivacySettingsPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings/account">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <AccountSettingsPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings/profile/edit">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <ProfileEditPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings/activity">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <ActivityLogPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings/blocked-users">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <BlockedUsersPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings/blocked-content">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <BlockedContentPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings/billing">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <BillingDashboard />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings/payment-history">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <PaymentHistory />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings/payment-methods">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <PaymentMethods />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings/security">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <SecuritySettingsPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings/privacy-page">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <PrivacyPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings/data-export">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <DataExportPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings/delete-account">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <DeleteAccountPage />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings/security-settings">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <SecuritySettings />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings/2fa-setup">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <TwoFactorSetup />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings/2fa-verify">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <TwoFactorVerify />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings/legal">
        <ProtectedRoute>
          <AppLayout>
            <Suspense fallback={<LoadingFallback />}>
              <LegalStatus />
            </Suspense>
          </AppLayout>
        </ProtectedRoute>
      </Route>
    </>
  );
}
