import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Eye, EyeOff, Check, X, Loader2, Sparkles, Heart, Users, Globe, Lock, HandHeart, CreditCard, ArrowRight, KeyRound, PartyPopper, Mail, CheckCircle, RefreshCw } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import tangoHeroImage from "@assets/stock_images/elegant_professional_e4da136e.jpg";
import { TalentMatchModal } from "@/components/TalentMatchModal";

export default function RegisterPage() {
  // Simple pattern - let react-i18next handle re-renders automatically
  const { t } = useTranslation('pages');
  const [, navigate] = useLocation();
  
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
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
  const [talentMatchOpen, setTalentMatchOpen] = useState(false);
  const [showVerificationSection, setShowVerificationSection] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  
  // Stats query - must be called before conditional return
  const { data: stats } = useQuery<{
    dancers: number | null;
    events: number | null;
    cities: number | null;
    countries: number | null;
  }>({
    queryKey: ["/api/stats/public"],
    staleTime: 5 * 60 * 1000,
  });
  
  // Username availability check - must be called before conditional return
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

  // Email availability check - must be called before conditional return
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
  
  
  const getCsrfToken = () => {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? match[1] : null;
  };
  
  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: t('register.toast.invalidCode.title', 'Invalid code'),
        description: t('register.toast.invalidCode.description', 'Please enter a valid 6-digit verification code.'),
        variant: "destructive",
      });
      return;
    }
    
    setIsVerifying(true);
    
    try {
      const csrfToken = getCsrfToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (csrfToken) {
        headers["x-xsrf-token"] = csrfToken;
      }
      
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ token: verificationCode }),
      });
      
      const data = await response.json();
      console.log("[RegisterPage] Verify-email response:", response.status, data);
      
      if (response.ok) {
        // Store access token for auto-login
        if (data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);
        }
        
        toast({
          title: t('register.toast.verified.title', 'Email verified!'),
          description: t('register.toast.verified.description', 'Welcome to Mundo Tango! Starting your onboarding...'),
        });
        
        // Full page reload to /onboarding/welcome (modular flow) so AuthContext re-initializes with new token
        window.location.href = "/onboarding/welcome";
      } else {
        console.error("[RegisterPage] Verify-email error - step:", data.step, "error:", data.error, "message:", data.message);
        toast({
          title: t('register.toast.verifyError.title', 'Verification failed'),
          description: data.message || t('register.toast.verifyError.description', 'Invalid or expired code. Please try again.'),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t('register.toast.error.title', 'Error'),
        description: t('register.toast.error.description', 'Failed to verify email. Please try again.'),
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };
  
  const handleResendCode = async () => {
    if (!verificationEmail) return;
    
    setIsResending(true);
    
    try {
      const csrfToken = getCsrfToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (csrfToken) {
        headers["x-xsrf-token"] = csrfToken;
      }
      
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ email: verificationEmail }),
      });
      
      if (response.status === 429) {
        toast({
          title: t('register.toast.tooMany.title', 'Too many requests'),
          description: t('register.toast.tooMany.description', 'Please wait a few minutes before trying again.'),
          variant: "destructive",
        });
      } else {
        setResendSuccess(true);
        setVerificationCode("");
        toast({
          title: t('register.toast.codeSent.title', 'Code sent!'),
          description: t('register.toast.codeSent.description', 'Please check your inbox for a new code.'),
        });
        setTimeout(() => setResendSuccess(false), 5000);
      }
    } catch (error) {
      toast({
        title: t('register.toast.error.title', 'Error'),
        description: t('register.toast.resendError.description', 'Failed to resend code. Please try again.'),
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };
  
  const handleCodeInputChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(digitsOnly);
  };

  const handleCodeChange = (code: string) => {
    setInviteCode(code);
    setIsCodeValid(code.toLowerCase().trim() === "nomad");
  };

  const getPasswordStrengthLabel = (score: number): string => {
    if (score <= 2) return t('register.passwordStrength.weak', 'Weak');
    if (score <= 4) return t('register.passwordStrength.medium', 'Medium');
    if (score <= 5) return t('register.passwordStrength.strong', 'Strong');
    return t('register.passwordStrength.veryStrong', 'Very Strong');
  };

  const calculatePasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[!@#$%^&*]/.test(pwd)) score++;

    if (score <= 2) return { score: 25, label: getPasswordStrengthLabel(score), color: "bg-red-500" };
    if (score <= 4) return { score: 50, label: getPasswordStrengthLabel(score), color: "bg-yellow-500" };
    if (score <= 5) return { score: 75, label: getPasswordStrengthLabel(score), color: "bg-green-500" };
    return { score: 100, label: getPasswordStrengthLabel(score), color: "bg-green-700" };
  };

  const passwordStrength = password ? calculatePasswordStrength(password) : null;
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordsDontMatch = confirmPassword && !passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAccepted) {
      toast({
        title: t('register.toast.termsRequired.title', 'Terms required'),
        description: t('register.toast.termsRequired.description', 'Please accept the Terms & Conditions'),
        variant: "destructive",
      });
      return;
    }

    if (!passwordsMatch) {
      toast({
        title: t('register.toast.passwordMismatch.title', "Passwords don't match"),
        description: t('register.toast.passwordMismatch.description', 'Please ensure both passwords are identical'),
        variant: "destructive",
      });
      return;
    }

    if (passwordStrength && passwordStrength.score < 50) {
      toast({
        title: t('register.toast.weakPassword.title', 'Weak password'),
        description: t('register.toast.weakPassword.description', 'Please choose a stronger password'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({ 
        name, 
        username, 
        email, 
        password, 
        inviteCode: inviteCode.trim() || undefined 
      });
      
      if (result.requiresVerification) {
        toast({
          title: t('register.toast.checkEmail.title', 'Check your email'),
          description: t('register.toast.checkEmail.description', 'We sent you a 6-digit verification code. Please check your inbox.'),
        });
        setVerificationEmail(result.email);
        setShowVerificationSection(true);
      }
    } catch (error: any) {
      toast({
        title: isCodeValid 
          ? t('register.toast.registrationFailed.title', 'Registration failed') 
          : t('register.toast.signupFailed.title', "Couldn't complete signup"),
        description: error.message || t('register.toast.tryAgain', 'Please try again'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <PublicLayout>
        <SEO
          title={t('register.seo.title', 'Join Mundo Tango - Create Your Account')}
          description={t('register.seo.description', 'Create your Mundo Tango account and join the global Argentine tango community. Connect with dancers, discover events, and share your passion for tango.')}
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
              className="w-full max-w-lg"
            >
              <div className="text-center mb-8">
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-welcome">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {waitlistSuccess 
                    ? t('register.badge.welcomeFamily', 'Welcome to the Family') 
                    : isCodeValid 
                      ? t('register.badge.beginJourney', 'Begin Your Journey') 
                      : t('register.badge.joinCommunity', 'Join the Community')}
                </Badge>
                
                <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-4 tracking-tight leading-tight" data-testid="heading-hero">
                  {waitlistSuccess 
                    ? t('register.hero.youreIn', "You're In!") 
                    : t('register.hero.joinMundoTango', 'Join Mundo Tango')}
                </h1>
                
                <p className="text-lg text-white/80 max-w-md mx-auto mb-8">
                  {waitlistSuccess 
                    ? t('register.hero.waitlistDescription', "Welcome to the Mundo Tango community. We're preparing your account and will notify you soon!")
                    : t('register.hero.description', 'Connect with dancers worldwide, discover milongas, and immerse yourself in the passionate world of Argentine tango')}
                </p>

                {!waitlistSuccess && (stats?.dancers || stats?.events || stats?.cities) && (
                  <div className="flex gap-6 justify-center mb-8 text-white/70 text-sm flex-wrap">
                    {stats?.dancers && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{t('register.stats.dancers', '{{count}}+ dancers', { count: stats.dancers })}</span>
                      </div>
                    )}
                    {stats?.events && (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>{t('register.stats.events', '{{count}}+ events', { count: stats.events })}</span>
                      </div>
                    )}
                    {stats?.cities && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span>{t('register.stats.cities', '{{count}} cities', { count: stats.cities })}</span>
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
                  className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl"
                  data-testid="section-waitlist-success"
                >
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <PartyPopper className="w-10 h-10 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-2">
                      {t('register.waitlist.welcomeUser', 'Welcome, {{name}}!', { name: name || t('register.waitlist.defaultName', 'Dancer') })}
                    </h3>
                    <p className="text-white/70 mb-8">
                      {t('register.waitlist.onTheList', "You're on the list. We'll email you at")} <span className="text-white font-medium">{email}</span> {t('register.waitlist.whenReady', 'when your account is ready.')}
                    </p>
                    
                    <div className="space-y-4">
                      <p className="text-sm text-white/60 font-medium uppercase tracking-wide">
                        {t('register.waitlist.helpUsGrow', 'While you wait, help us grow')}
                      </p>
                      <div className="flex flex-col gap-3">
                        <Button 
                          className="w-full bg-white text-black hover:bg-white/90"
                          size="lg"
                          onClick={() => setTalentMatchOpen(true)}
                          data-testid="button-volunteer-cta"
                        >
                          <HandHeart className="mr-2 h-5 w-5" />
                          {t('register.waitlist.volunteerWithUs', 'Volunteer with us')}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Link href="/crowdfunding">
                          <Button 
                            variant="outline" 
                            className="w-full border-white/30 text-white hover:bg-white/10"
                            size="lg"
                            data-testid="button-support-cta"
                          >
                            <CreditCard className="mr-2 h-5 w-5" />
                            {t('register.waitlist.supportMundoTango', 'Support Mundo Tango')}
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                    
                    <TalentMatchModal 
                      open={talentMatchOpen}
                      onOpenChange={setTalentMatchOpen}
                      initialName={name}
                      initialEmail={email}
                    />
                  </div>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: showVerificationSection ? 0.4 : 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className={`backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-4 md:p-6 shadow-2xl mb-4 ${showVerificationSection ? 'pointer-events-none select-none' : ''}`}
                    data-testid="section-invite-code"
                  >
                    <div className="space-y-3">
                      <Label htmlFor="inviteCode" className="text-sm font-medium text-white flex items-center gap-2">
                        <KeyRound className="w-4 h-4" />
                        {t('register.inviteCode.label', 'Have an invite code? (Optional)')}
                      </Label>
                      <div className="relative">
                        <Input
                          id="inviteCode"
                          type="text"
                          placeholder={t('register.inviteCode.placeholder', 'Enter your invite code for immediate access')}
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
                          <Check className="h-3 w-3" /> {t('register.inviteCode.accepted', 'Code accepted! Your account will be activated immediately.')}
                        </p>
                      )}
                      {inviteCode && !isCodeValid && (
                        <p className="text-sm text-amber-400/80">
                          {t('register.inviteCode.noWorries', 'No worries! Complete the form below to join our waitlist.')}
                        </p>
                      )}
                    </div>
                  </motion.div>

                  <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: showVerificationSection ? 0.4 : 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    onSubmit={handleSubmit}
                    className={`backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 md:p-8 shadow-2xl ${showVerificationSection ? 'pointer-events-none select-none' : ''}`}
                    data-testid="form-register"
                  >
                    {!isCodeValid && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 mb-6">
                        <Lock className="w-5 h-5 text-white/60 flex-shrink-0" />
                        <p className="text-sm text-white/70">
                          {t('register.form.inviteOnlyNotice', "Registration is currently invite-only. Complete this form to join our waitlist and we'll notify you when your account is ready.")}
                        </p>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium text-white">
                            {t('register.form.fullName', 'Full Name')}
                          </Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder={t('register.form.fullNamePlaceholder', 'Maria Rodriguez')}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={isLoading}
                            data-testid="input-name"
                            className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium text-white">
                            {t('register.form.email', 'Email')}
                          </Label>
                          <div className="relative">
                            <Input
                              id="email"
                              type="email"
                              placeholder={t('register.form.emailPlaceholder', 'maria@example.com')}
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
                            <p className="text-sm text-red-400">
                              {t('register.validation.emailTaken', 'This email is already registered')}
                            </p>
                          )}
                          {emailAvailable === true && (
                            <p className="text-sm text-green-400">
                              {t('register.validation.emailAvailable', 'Email available!')}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-sm font-medium text-white">
                          {t('register.form.username', 'Username')}
                        </Label>
                        <div className="relative">
                          <Input
                            id="username"
                            type="text"
                            placeholder={t('register.form.usernamePlaceholder', 'maria_tango')}
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
                          <p className="text-sm text-red-400">
                            {t('register.validation.usernameTaken', 'Username taken. Try {{suggestion}}', { suggestion: `${username}_2025` })}
                          </p>
                        )}
                        {usernameAvailable === true && (
                          <p className="text-sm text-green-400">
                            {t('register.validation.usernameAvailable', 'Username available!')}
                          </p>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-sm font-medium text-white">
                            {t('register.form.password', 'Password')}
                          </Label>
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
                          <Label htmlFor="confirmPassword" className="text-sm font-medium text-white">
                            {t('register.form.confirmPassword', 'Confirm Password')}
                          </Label>
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
                              <Check className="h-3 w-3" /> {t('register.validation.passwordsMatch', 'Passwords match')}
                            </p>
                          )}
                          {passwordsDontMatch && (
                            <p className="text-sm text-red-400 flex items-center gap-1">
                              <X className="h-3 w-3" /> {t('register.validation.passwordsDontMatch', "Passwords don't match")}
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
                          {t('register.form.acceptTermsPrefix', 'I accept the')}{" "}
                          <Link 
                            href="/terms"
                            className="text-white hover:underline font-medium"
                          >
                            {t('register.form.termsAndConditions', 'Terms & Conditions')}
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
                            {isCodeValid 
                              ? t('register.button.creatingAccount', 'Creating your account...') 
                              : t('register.button.joining', 'Joining...')}
                          </>
                        ) : (
                          <>
                            <Heart className="mr-2 h-4 w-4" />
                            {isCodeValid 
                              ? t('register.button.createAccount', 'Create Account') 
                              : t('register.button.joinMundoTango', 'Join Mundo Tango')}
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.form>
                </>
              )}

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: showVerificationSection ? 0.4 : 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className={`text-sm text-center text-white/70 mt-6 ${showVerificationSection ? 'pointer-events-none select-none' : ''}`}
              >
                {t('register.alreadyHaveAccount', 'Already have an account?')}{" "}
                <Link 
                  href="/login" 
                  className="text-white hover:underline font-medium" 
                  data-testid="link-login"
                >
                  {t('register.signIn', 'Sign in')}
                </Link>
              </motion.p>

              {showVerificationSection ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
                  data-testid="section-verification-code"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">
                        {t('register.verification.title', 'Enter Verification Code')}
                      </h3>
                      <p className="text-sm text-white/70">
                        {t('register.verification.subtitle', 'Code sent to:')} {verificationEmail}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-white/80 mb-4">
                    {t('register.verification.instructions', 'Enter the 6-digit code from your email to verify your account.')}
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="000000"
                        value={verificationCode}
                        onChange={(e) => handleCodeInputChange(e.target.value)}
                        className="text-center text-2xl tracking-[0.5em] font-mono w-48 bg-white/20 border-white/30 text-white placeholder:text-white/30"
                        maxLength={6}
                        data-testid="input-verification-code"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleVerify}
                      disabled={isVerifying || verificationCode.length !== 6}
                      className="w-full gap-2"
                      data-testid="button-verify"
                    >
                      {isVerifying ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      {t('register.verification.verifyButton', 'Verify Email')}
                    </Button>
                    
                    <div className="text-center">
                      <p className="text-white/60 text-sm mb-2">
                        {t('register.verification.didntReceive', "Didn't receive the code?")}
                      </p>
                      <Button 
                        variant="ghost" 
                        onClick={handleResendCode}
                        disabled={isResending || resendSuccess}
                        className="gap-2 text-white/80 hover:text-white hover:bg-white/10"
                        data-testid="button-resend"
                      >
                        {isResending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : resendSuccess ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        {resendSuccess 
                          ? t('register.verification.codeResent', 'Code Resent!')
                          : t('register.verification.resendButton', 'Resend Code')
                        }
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <HandHeart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {t('register.volunteer.title', 'Want to volunteer?')}
                      </h3>
                      <p className="text-sm text-white/70">
                        {t('register.volunteer.subtitle', 'Help build the tango community')}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-white/80 mb-4">
                    {t('register.volunteer.description', 'Join our volunteer team and use your skills to make an impact. Our AI will match you with the perfect role.')}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent border-white/30 text-white hover:bg-white/10"
                    onClick={() => setTalentMatchOpen(true)}
                    data-testid="button-start-talent-match"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t('register.volunteer.startTalentMatch', 'Start Talent Match')}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        <TalentMatchModal
          open={talentMatchOpen}
          onOpenChange={setTalentMatchOpen}
          initialName={name}
          initialEmail={email}
        />
      </PublicLayout>
  );
}
