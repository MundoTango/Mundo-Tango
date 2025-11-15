/**
 * Visual Editor - Replit-style Development Environment (Rebuilt from scratch)
 * Phase 2: Authentication + God Level Detection
 */

import { useQuery } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert, Crown } from "lucide-react";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function VisualEditorPage() {
  // Fetch current user
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/auth/me'],
  });

  // God Level check
  const isGodLevel = user?.role === 'god';

  // Loading state
  if (isLoading) {
    return (
      <>
        <SEO 
          title="Visual Editor - Mundo Tango"
          description="Replit-style development environment with AI assistance"
        />
        <div className="h-screen w-full bg-background flex items-center justify-center">
          <Card className="w-96">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                Loading Visual Editor...
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Access denied for non-God Level users
  if (!isGodLevel) {
    return (
      <>
        <SEO 
          title="Access Denied - Visual Editor"
          description="God Level access required"
        />
        <div className="h-screen w-full bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-destructive" />
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertDescription>
                  The Visual Editor requires God Level (Tier 8) access.
                  {user ? ` Your current role: ${user.role}` : ' Please log in.'}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // God Level access confirmed
  return (
    <>
      <SEO 
        title="Visual Editor - Mundo Tango"
        description="Replit-style development environment with AI assistance"
      />
      
      <div className="h-screen w-full bg-background p-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Visual Editor - God Level Access Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                ✅ Phase 1: Minimal page structure working
              </AlertDescription>
            </Alert>
            <Alert>
              <AlertDescription>
                ✅ Phase 2: Authentication & God Level detection working
              </AlertDescription>
            </Alert>
            <Alert>
              <AlertDescription>
                👤 Logged in as: {user.name} ({user.email})
              </AlertDescription>
            </Alert>
            <Alert>
              <AlertDescription>
                🚀 Next: Adding tab structure (Mr. Blue, Autonomous, Git, etc.)
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
