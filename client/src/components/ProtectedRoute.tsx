import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  // Show loading state while authentication is being verified
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-8">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  // Only redirect after loading is complete and user is confirmed null
  if (!user) {
    console.log('[ProtectedRoute] No authenticated user - redirecting to login');
    return <Redirect to="/login" />;
  }

  // User is authenticated - render protected content
  return <>{children}</>;
}
