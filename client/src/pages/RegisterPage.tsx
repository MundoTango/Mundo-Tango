import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { PageLayout } from "@/components/PageLayout";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();

  const calculatePasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[!@#$%^&*]/.test(pwd)) score++;

    if (score <= 2) return { score: 25, label: "Weak", color: "bg-red-500" };
    if (score <= 4) return { score: 50, label: "Medium", color: "bg-yellow-500" };
    if (score <= 5) return { score: 75, label: "Strong", color: "bg-green-500" };
    return { score: 100, label: "Very Strong", color: "bg-green-700" };
  };

  const passwordStrength = password ? calculatePasswordStrength(password) : null;
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordsDontMatch = confirmPassword && !passwordsMatch;

  useEffect(() => {
    if (username.length >= 3) {
      const checkUsername = async () => {
        setIsCheckingUsername(true);
        try {
          const response = await fetch(`/api/auth/check-username/${username}`);
          const data = await response.json();
          setUsernameAvailable(data.available);
        } catch (error) {
          console.error("Username check error:", error);
        } finally {
          setIsCheckingUsername(false);
        }
      };
      
      const debounce = setTimeout(checkUsername, 500);
      return (
    <PageLayout title="Join Mundo Tango" showBreadcrumbs>

    </PageLayout>) => clearTimeout(debounce);
    } else {
      setUsernameAvailable(null);
    }
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAccepted) {
      toast({
        title: "Terms required",
        description: "Please accept the Terms & Conditions",
        variant: "destructive",
      });
      return;
    }

    if (!passwordsMatch) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords are identical",
        variant: "destructive",
      });
      return;
    }

    if (passwordStrength && passwordStrength.score < 50) {
      toast({
        title: "Weak password",
        description: "Please choose a stronger password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await register({ name, username, email, password });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicLayout>
      <SEO
        title="Join Mundo Tango"
        description="Create your Mundo Tango account and join the global Argentine tango community. Connect with dancers, discover events, and share your passion for tango."
      />
      <div className="flex min-h-screen items-center justify-center relative overflow-hidden p-4">
        {/* Ocean Gradient Background */}
        <div className="absolute inset-0 -z-20 ocean-gradient opacity-30" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-accent/5 to-background" />
        
        <div className="w-full max-w-[480px]">
          <form onSubmit={handleSubmit} className="glass-card p-8 rounded-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Join Mundo Tango</h1>
              <p className="text-muted-foreground">Create your account to connect with dancers worldwide</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Maria Rodriguez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  data-testid="input-name"
                  className="bg-background/60 backdrop-blur-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="maria@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  data-testid="input-email"
                  className="bg-background/60 backdrop-blur-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    placeholder="maria_tango"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    required
                    minLength={3}
                    maxLength={20}
                    disabled={isLoading}
                    data-testid="input-username"
                    className="bg-background/60 backdrop-blur-sm pr-10"
                  />
                  {isCheckingUsername && (
                    <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  {!isCheckingUsername && usernameAvailable === true && (
                    <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" data-testid="icon-username-available" />
                  )}
                  {!isCheckingUsername && usernameAvailable === false && (
                    <X className="absolute right-3 top-3 h-4 w-4 text-red-500" data-testid="icon-username-taken" />
                  )}
                </div>
                {usernameAvailable === false && (
                  <p className="text-sm text-red-500">Username already taken. Try {username}_2025</p>
                )}
                {usernameAvailable === true && (
                  <p className="text-sm text-green-500">Username available!</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={isLoading}
                    data-testid="input-password"
                    className="bg-background/60 backdrop-blur-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordStrength && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${passwordStrength.color}`}
                          style={{ width: `${passwordStrength.score}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{passwordStrength.label}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    data-testid="input-confirm-password"
                    className="bg-background/60 backdrop-blur-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    data-testid="button-toggle-confirm-password"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordsMatch && (
                  <p className="text-sm text-green-500 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Passwords match
                  </p>
                )}
                {passwordsDontMatch && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <X className="h-3 w-3" /> Passwords don't match
                  </p>
                )}
              </div>

              <div className="flex items-start gap-2 pt-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  disabled={isLoading}
                  data-testid="checkbox-terms"
                />
                <label htmlFor="terms" className="text-sm leading-tight cursor-pointer">
                  I accept the{" "}
                  <Link href="/terms">
                    <a className="text-primary hover:underline" target="_blank">
                      Terms & Conditions
                    </a>
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full mt-6"
                size="lg"
                disabled={isLoading || !termsAccepted || usernameAvailable === false}
                data-testid="button-register"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login">
              <a className="text-primary hover:underline font-medium" data-testid="link-login">
                Sign in
              </a>
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
