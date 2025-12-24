import { lazy, Suspense } from "react";
import { Route } from "wouter";
import { LoadingFallback } from "@/components/LoadingFallback";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";

const FacebookCallbackPage = lazy(() => import("@/pages/auth/FacebookCallbackPage"));
const PasswordResetPage = lazy(() => import("@/pages/PasswordResetPage"));
const NewPasswordPage = lazy(() => import("@/pages/NewPasswordPage"));
const EmailVerificationPage = lazy(() => import("@/pages/EmailVerificationPage"));
const TwoFactorAuthPage = lazy(() => import("@/pages/TwoFactorAuthPage"));

export function AuthRoutes() {
  return (
    <>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/auth/callback">
        <Suspense fallback={<LoadingFallback />}>
          <FacebookCallbackPage />
        </Suspense>
      </Route>
      <Route path="/password-reset">
        <Suspense fallback={<LoadingFallback />}>
          <PasswordResetPage />
        </Suspense>
      </Route>
      <Route path="/forgot-password">
        <Suspense fallback={<LoadingFallback />}>
          <PasswordResetPage />
        </Suspense>
      </Route>
      <Route path="/reset-password/:token">
        <Suspense fallback={<LoadingFallback />}>
          <NewPasswordPage />
        </Suspense>
      </Route>
      <Route path="/email-verification">
        <Suspense fallback={<LoadingFallback />}>
          <EmailVerificationPage />
        </Suspense>
      </Route>
      <Route path="/2fa">
        <Suspense fallback={<LoadingFallback />}>
          <TwoFactorAuthPage />
        </Suspense>
      </Route>
    </>
  );
}
