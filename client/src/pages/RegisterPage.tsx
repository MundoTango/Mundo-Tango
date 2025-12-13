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
import { Eye, EyeOff, Check, X, Loader2, Sparkles, Heart, Users, Globe, Lock, HandHeart, CreditCard, ArrowRight, KeyRound, PartyPopper, Star, Headphones } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import tangoHeroImage from "@assets/stock_images/elegant_professional_e4da136e.jpg";

export default function RegisterPage() {
  const [inviteCode, setInviteCode] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
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
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();

  // Store registration role from URL params for post-onboarding routing
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role');
    if (role) {
      localStorage.setItem('registrationRole', role);
    }
  }, []);

  const handleCodeChange = (code: string) => {
    setInviteCode(code);
    setIsCodeValid(code.toLowerCase().trim() === "nomad");
  };

  const { data: stats } = useQuery<{
    dancers: number | null;
    events: number | null;
    cities: number | null;
    countries: number | null;
  }>({
    queryKey: ["/api/stats/public"],
    staleTime: 5 * 60 * 1000,
  });

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
          if (!response.ok) {
            console.error("Username check failed:", response.status);
            setUsernameAvailable(null);
            return;
          }
          const data = await response.json();
          setUsernameAvailable(data.available);
        } catch (error) {
          console.error("Username check error:", error);
          setUsernameAvailable(null);
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

  useEffect(() => {
    if (email.length >= 5 && email.includes('@')) {
      const checkEmail = async () => {
        setIsCheckingEmail(true);
        try {
          const response = await fetch(`/api/auth/check-email/${encodeURIComponent(email)}`);
          if (!response.ok) {
            console.error("Email check failed:", response.status);
            setEmailAvailable(null);
            return;
          }
          const data = await response.json();
          setEmailAvailable(data.available);
        } catch (error) {
          console.error("Email check error:", error);
          setEmailAvailable(null);
        } finally {
          setIsCheckingEmail(false);
        }
      };
      
      const debounce = setTimeout(checkEmail, 500);
      return () => clearTimeout(debounce);
    } else {
      setEmailAvailable(null);
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return;
    }

    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address (e.g., name@example.com)",
        variant: "destructive",
      });
      return;
    }

    if (emailAvailable === false) {
      toast({
        title: "Email already registered",
        description: "This email is already in use. Please try another.",
        variant: "destructive",
      });
      return;
    }

    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }

    if (usernameAvailable === false) {
      toast({
        title: "Username taken",
        description: "Please choose a different username",
        variant: "destructive",
      });
      return;
    }

    if (!password) {
      toast({
        title: "Password required",
        description: "Please enter a password",
        variant: "destructive",
      });
      return;
    }

    if (!confirmPassword) {
      toast({
        title: "Confirm password",
        description: "Please confirm your password",
        variant: "destructive",
      });
      return;
    }

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
      if (isCodeValid) {
        // Full registration with invite code - proceed to onboarding
        await register({ name, username, email, password, inviteCode });
      } else {
        // No invite code - add to waitlist only (no onboarding access)
        const response = await fetch("/api/auth/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email, 
            name: name || undefined,
            username: username || undefined,
            password: password || undefined,
            proceedToOnboarding: false, // Waitlist only - no onboarding access
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || "Failed to complete signup");
        }
        
        // Store tokens if returned (for future use when approved)
        if (data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem("refreshToken", data.refreshToken);
          }
        }
        
        // Always show waitlist confirmation page for users without invite code
        setWaitlistSuccess(true);
        toast({
          title: "You're on the waitlist!",
          description: "We'll notify you when your account is ready. In the meantime, check out how you can get involved!",
        });
      }
    } catch (error: any) {
      toast({
        title: isCodeValid ? "Registration failed" : "Couldn't complete signup",
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

        <div className="relative min-h-screen w-full overflow-hidden" data-testid="hero-register">
          <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${tangoHeroImage})`}}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`w-full ${waitlistSuccess ? 'max-w-4xl' : 'max-w-lg'}`}
            >
              <div className="text-center mb-8">
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-welcome">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {waitlistSuccess ? "Welcome to the Family" : isCodeValid ? "Begin Your Journey" : "Join the Community"}
                </Badge>
                
                <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-4 tracking-tight leading-tight" data-testid="heading-hero">
                  {waitlistSuccess ? "You're In!" : "Join Mundo Tango"}
                </h1>
                
                <p className="text-lg text-white/80 max-w-md mx-auto mb-8">
                  {waitlistSuccess 
                    ? "Welcome to the Mundo Tango community. We're preparing your account and will notify you soon!"
                    : "Connect with dancers worldwide, discover milongas, and immerse yourself in the passionate world of Argentine tango"}
                </p>

                {!waitlistSuccess && (stats?.dancers || stats?.events || stats?.cities) && (
                  <div className="flex gap-6 justify-center mb-8 text-white/70 text-sm flex-wrap">
                    {stats?.dancers && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{stats.dancers}+ dancers</span>
                      </div>
                    )}
                    {stats?.events && (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>{stats.events}+ events</span>
                      </div>
                    )}
                    {stats?.cities && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span>{stats.cities} cities</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {waitlistSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl max-w-4xl"
                  data-testid="section-waitlist-success"
                >
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <PartyPopper className="w-10 h-10 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-2">Welcome, {name || "Dancer"}!</h3>
                    <p className="text-white/70">You're on the waitlist. We'll email you at <span className="text-white font-medium">{email}</span> when your account is ready.</p>
                  </div>
                  
                  <div className="border-t border-white/10 pt-8">
                    <p className="text-sm text-white/60 font-medium uppercase tracking-wide text-center mb-6">While you wait, get involved</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex flex-col items-center text-center">
                        <Link href="/talent-match" className="w-full">
                          <Button 
                            className="w-full bg-white text-black hover:bg-white/90 mb-4"
                            size="lg"
                            data-testid="button-volunteer-cta"
                          >
                            <HandHeart className="mr-2 h-5 w-5" />
                            Volunteer
                          </Button>
                        </Link>
                        <p className="text-white/70 text-sm">
                          Join our volunteer team and help build the global tango community. Contribute your skills in translation, event coordination, content creation, and more.
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-center text-center">
                        <Link href="/ambassadors" className="w-full">
                          <Button 
                            variant="outline" 
                            className="w-full border-white/30 text-white hover:bg-white/10 mb-4"
                            size="lg"
                            data-testid="button-ambassador-cta"
                          >
                            <Star className="mr-2 h-5 w-5" />
                            Ambassador
                          </Button>
                        </Link>
                        <p className="text-white/70 text-sm">
                          Represent Mundo Tango in your city. Ambassadors help grow the local tango scene, connect dancers, and bring our global community together.
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-center text-center">
                        <Link href="/support" className="w-full">
                          <Button 
                            variant="outline" 
                            className="w-full border-white/30 text-white hover:bg-white/10 mb-4"
                            size="lg"
                            data-testid="button-support-cta"
                          >
                            <Headphones className="mr-2 h-5 w-5" />
                            Support
                          </Button>
                        </Link>
                        <p className="text-white/70 text-sm">
                          Need help or have questions? Our support team is here to assist you with any inquiries about your waitlist status or the platform.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-4 md:p-6 shadow-2xl mb-4"
                    data-testid="section-invite-code"
                  >
                    <div className="space-y-3">
                      <Label htmlFor="inviteCode" className="text-sm font-medium text-white flex items-center gap-2">
                        <KeyRound className="w-4 h-4" />
                        Have an invite code? (Optional)
                      </Label>
                      <div className="relative">
                        <Input
                          id="inviteCode"
                          type="text"
                          placeholder="Enter your invite code for immediate access"
                          value={inviteCode}
                          onChange={(e) => handleCodeChange(e.target.value)}
                          data-testid="input-invite-code"
                          className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/50 focus:border-white/40 pr-10"
                        />
                        {inviteCode && (
                          isCodeValid ? (
                            <Check className="absolute right-3 top-3 h-4 w-4 text-green-400" data-testid="icon-code-valid" />
                          ) : (
                            <X className="absolute right-3 top-3 h-4 w-4 text-amber-400" data-testid="icon-code-invalid" />
                          )
                        )}
                      </div>
                      {isCodeValid && (
                        <p className="text-sm text-green-400 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Code accepted! Your account will be activated immediately.
                        </p>
                      )}
                      {inviteCode && !isCodeValid && (
                        <p className="text-sm text-amber-400/80">No worries! Complete the form below to join our waitlist.</p>
                      )}
                    </div>
                  </motion.div>

                  <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    onSubmit={handleSubmit}
                    className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 md:p-8 shadow-2xl"
                    data-testid="form-register"
                  >
                    {!isCodeValid && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 mb-6">
                        <Lock className="w-5 h-5 text-white/60 flex-shrink-0" />
                        <p className="text-sm text-white/70">
                          Registration is currently invite-only. Complete this form to join our waitlist and we'll notify you when your account is ready.
                        </p>
                      </div>
                    )}
                    
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
                          <div className="relative">
                            <Input
                              id="email"
                              type="email"
                              placeholder="maria@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              disabled={isLoading}
                              data-testid="input-email"
                              className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/50 focus:border-white/40 pr-10"
                            />
                            {isCheckingEmail && (
                              <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-white/70" />
                            )}
                            {!isCheckingEmail && emailAvailable === true && (
                              <Check className="absolute right-3 top-3 h-4 w-4 text-green-400" data-testid="icon-email-available" />
                            )}
                            {!isCheckingEmail && emailAvailable === false && (
                              <X className="absolute right-3 top-3 h-4 w-4 text-red-400" data-testid="icon-email-taken" />
                            )}
                          </div>
                          {emailAvailable === false && (
                            <p className="text-sm text-red-400">This email is already registered</p>
                          )}
                          {emailAvailable === true && (
                            <p className="text-sm text-green-400">Email available!</p>
                          )}
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
                        disabled={isLoading || !termsAccepted || usernameAvailable === false || emailAvailable === false}
                        data-testid="button-register"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isCodeValid ? "Creating your account..." : "Joining..."}
                          </>
                        ) : (
                          <>
                            <Heart className="mr-2 h-4 w-4" />
                            {isCodeValid ? "Create Account" : "Join Mundo Tango"}
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.form>
                </>
              )}

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
