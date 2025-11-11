import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Eye, EyeOff, Check, X, Loader2, Sparkles, Heart, Users, Globe } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import tangoHeroImage from "@assets/stock_images/elegant_professional_e4da136e.jpg";

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
      return () => clearTimeout(debounce);
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
    <SelfHealingErrorBoundary pageName="Register" fallbackRoute="/login">
      <PublicLayout>
        <SEO
          title="Join Mundo Tango - Create Your Account"
          description="Create your Mundo Tango account and join the global Argentine tango community. Connect with dancers, discover events, and share your passion for tango."
        />

        {/* Editorial Hero Section - Full Screen */}
        <div className="relative min-h-screen w-full overflow-hidden" data-testid="hero-register">
          <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${tangoHeroImage})`}}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="w-full max-w-lg"
            >
              {/* Editorial Header */}
              <div className="text-center mb-8">
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-welcome">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Begin Your Journey
                </Badge>
                
                <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-4 tracking-tight leading-tight" data-testid="heading-hero">
                  Join Mundo Tango
                </h1>
                
                <p className="text-lg text-white/80 max-w-md mx-auto mb-8">
                  Connect with dancers worldwide, discover milongas, and immerse yourself in the passionate world of Argentine tango
                </p>

                {/* Community Stats */}
                <div className="flex gap-6 justify-center mb-8 text-white/70 text-sm flex-wrap">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>10,000+ dancers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>500+ events</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>120 cities</span>
                  </div>
                </div>
              </div>

              {/* Glassmorphic Registration Form */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                onSubmit={handleSubmit}
                className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 md:p-8 shadow-2xl"
                data-testid="form-register"
              >
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-white">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Maria Rodriguez"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={isLoading}
                        data-testid="input-name"
                        className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="maria@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        data-testid="input-email"
                        className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-white">Username</Label>
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
                        className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/50 focus:border-white/40 pr-10"
                      />
                      {isCheckingUsername && (
                        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-white/70" />
                      )}
                      {!isCheckingUsername && usernameAvailable === true && (
                        <Check className="absolute right-3 top-3 h-4 w-4 text-green-400" data-testid="icon-username-available" />
                      )}
                      {!isCheckingUsername && usernameAvailable === false && (
                        <X className="absolute right-3 top-3 h-4 w-4 text-red-400" data-testid="icon-username-taken" />
                      )}
                    </div>
                    {usernameAvailable === false && (
                      <p className="text-sm text-red-400">Username taken. Try {username}_2025</p>
                    )}
                    {usernameAvailable === true && (
                      <p className="text-sm text-green-400">Username available!</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-white">Password</Label>
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
                          className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/50 focus:border-white/40 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-white/70 hover:text-white"
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordStrength && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${passwordStrength.color}`}
                                style={{ width: `${passwordStrength.score}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-white/80">{passwordStrength.label}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-white">Confirm Password</Label>
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
                          className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/50 focus:border-white/40 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-white/70 hover:text-white"
                          data-testid="button-toggle-confirm-password"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordsMatch && (
                        <p className="text-sm text-green-400 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Passwords match
                        </p>
                      )}
                      {passwordsDontMatch && (
                        <p className="text-sm text-red-400 flex items-center gap-1">
                          <X className="h-3 w-3" /> Passwords don't match
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-2">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                      disabled={isLoading}
                      data-testid="checkbox-terms"
                      className="border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-black"
                    />
                    <label htmlFor="terms" className="text-sm leading-tight cursor-pointer text-white/90">
                      I accept the{" "}
                      <Link href="/terms">
                        <a className="text-white hover:underline font-medium" target="_blank">
                          Terms & Conditions
                        </a>
                      </Link>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-6 bg-white text-black hover:bg-white/90"
                    size="lg"
                    disabled={isLoading || !termsAccepted || usernameAvailable === false}
                    data-testid="button-register"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating your account...
                      </>
                    ) : (
                      <>
                        <Heart className="mr-2 h-4 w-4" />
                        Create Account
                      </>
                    )}
                  </Button>
                </div>
              </motion.form>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-sm text-center text-white/70 mt-6"
              >
                Already have an account?{" "}
                <Link 
                  href="/login" 
                  className="text-white hover:underline font-medium" 
                  data-testid="link-login"
                >
                  Sign in
                </Link>
              </motion.p>
            </motion.div>
          </div>
        </div>
      </PublicLayout>
    </SelfHealingErrorBoundary>
  );
}
