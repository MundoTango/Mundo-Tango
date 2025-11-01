import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { PublicLayout } from "@/components/PublicLayout";
import { PageLayout } from "@/components/PageLayout";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout title="Welcome Back" showBreadcrumbs>
<PublicLayout>
      <SEO
        title="Sign In - Mundo Tango"
        description="Sign in to your Mundo Tango account to connect with the global tango community, discover events, and share your passion for Argentine tango."
      />
      <div className="flex min-h-screen items-center justify-center relative overflow-hidden p-4">
        {/* Ocean Gradient Background */}
        <div className="absolute inset-0 -z-20 ocean-gradient opacity-30" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-accent/5 to-background" />
        
        {/* Glassmorphic Login Card */}
        <div className="w-full max-w-[480px]">
          <form onSubmit={handleSubmit} className="glass-card p-8 rounded-2xl">
            

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  data-testid="input-email"
                  className="bg-background/60 backdrop-blur-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  data-testid="input-password"
                  className="bg-background/60 backdrop-blur-sm"
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-6"
                disabled={isLoading}
                data-testid="button-login"
                size="lg"
              >
                {isLoading ? "Signing in..." : "Log In"}
              </Button>

              <Link href="/password-reset">
                <a className="block text-center text-sm text-primary hover:underline mt-4" data-testid="link-forgot-password">
                  Forgot password?
                </a>
              </Link>
            </div>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link href="/register">
              <a className="text-primary hover:underline font-medium" data-testid="link-register">
                Sign up
              </a>
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
    </PageLayout>);
}
