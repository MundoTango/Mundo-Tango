import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { PublicLayout } from "@/components/PublicLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { Heart, Sparkles, Users, KeyRound, Check, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import tangoHeroImage from "@assets/stock_images/elegant_professional_29e89c1e.jpg";

export default function LoginPage() {
  const { t } = useTranslation(['pages', 'common']);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const redirectTo = searchParams.get("redirect") || "/feed";
  const { data: stats } = useQuery<{
    dancers: number | null;
    events: number | null;
    cities: number | null;
  }>({
    queryKey: ["/api/stats/public"],
    staleTime: 5 * 60 * 1000,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await login(email, password, inviteCode || undefined);
      if (result?.requiresVerification) {
        toast({
          title: t('pages:login.toast.verificationRequired.title', 'Email verification required'),
          description: t('pages:login.toast.verificationRequired.description', 'Please check your inbox and verify your email first.'),
          variant: "destructive",
        });
        setLocation(`/email-verification?email=${encodeURIComponent(result.verificationEmail || email)}`);
        return;
      }
      if (result?.upgraded) {
        toast({
          title: t('pages:login.toast.upgradedTitle', 'Account Upgraded!'),
          description: t('pages:login.toast.upgradedDescription', "Welcome! You now have full access to Mundo Tango."),
        });
      } else {
        toast({
          title: t('pages:login.toast.successTitle', 'Welcome back!'),
          description: t('pages:login.toast.successDescription', "You've successfully logged in."),
        });
      }
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 100);
    } catch (error: any) {
      toast({
        title: t('pages:login.toast.errorTitle', 'Login failed'),
        description: error.message || t('pages:login.toast.errorDescription', 'Invalid credentials'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SelfHealingErrorBoundary pageName={t('pages:login.pageName', 'Login')} fallbackRoute="/">
      <PublicLayout>
        <SEO
          title={t('pages:login.seo.title', 'Sign In - Mundo Tango')}
          description={t('pages:login.seo.description', 'Sign in to your Mundo Tango account to connect with the global tango community, discover events, and share your passion for Argentine tango.')}
        />
        <div className="relative h-screen w-full overflow-hidden" data-testid="hero-login">
          <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${tangoHeroImage})`}}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />
          </div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="w-full max-w-md"
            >
              <div className="text-center mb-8">
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-welcome">
                  <Heart className="w-3 h-3 mr-1" />
                  {t('pages:login.badge', 'Welcome Back')}
                </Badge>
                <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-4 tracking-tight leading-tight" data-testid="heading-hero">
                  {t('pages:login.hero.heading', 'Your Tango Journey Continues')}
                </h1>
                <p className="text-lg text-white/80 max-w-md mx-auto mb-8">
                  {t('pages:login.hero.paragraph', 'Sign in to connect with dancers worldwide, discover events, and share your passion')}
                </p>
                {(stats?.dancers || stats?.events) && (
                  <div className="flex gap-6 justify-center mb-8 text-white/70 text-sm">
                    {stats?.dancers && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{stats.dancers}+ {t('pages:login.stats.dancers', 'dancers')}</span>
                      </div>
                    )}
                    {stats?.events && (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>{stats.events}+ {t('pages:login.stats.events', 'events')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                onSubmit={handleSubmit}
                className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl"
                data-testid="form-login"
              >
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-white">{t('pages:login.form.email', 'Email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      data-testid="input-email"
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-white">{t('pages:login.form.password', 'Password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      data-testid="input-password"
                      className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setShowInviteCode(!showInviteCode)}
                      className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                      data-testid="button-toggle-invite-code"
                    >
                      <KeyRound className="w-4 h-4" />
                      {t('pages:login.form.haveInviteCode', 'Have an invite code?')}
                    </button>
                    {showInviteCode && (
                      <div className="relative">
                        <Input
                          id="inviteCode"
                          type="text"
                          placeholder={t('pages:login.form.inviteCodePlaceholder', 'Enter invite code')}
                          value={inviteCode}
                          onChange={(e) => setInviteCode(e.target.value)}
                          disabled={isLoading}
                          data-testid="input-invite-code"
                          className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/50 focus:border-white/40 pr-10"
                        />
                        {inviteCode && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {inviteCode.toLowerCase().trim() === "nomad" ? (
                              <Check className="w-5 h-5 text-green-400" data-testid="icon-code-valid" />
                            ) : (
                              <X className="w-5 h-5 text-red-400" data-testid="icon-code-invalid" />
                            )}
                          </div>
                        )}
                        {inviteCode.toLowerCase().trim() === "nomad" && (
                          <p className="text-xs text-green-400 mt-1" data-testid="text-upgrade-message">
                            {t('pages:login.form.upgradeMessage', 'Your account will be upgraded from waitlist!')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full mt-6 bg-white text-black hover:bg-white/90"
                    disabled={isLoading}
                    data-testid="button-login"
                    size="lg"
                  >
                    {isLoading ? t('pages:login.form.signingIn', 'Signing in...') : t('pages:login.form.signIn', 'Sign In')}
                  </Button>
                  <Link 
                    href="/password-reset" 
                    className="block text-center text-sm text-white/80 hover:text-white mt-4 transition-colors" 
                    data-testid="link-forgot-password"
                  >
                    {t('pages:login.form.forgotPassword', 'Forgot password?')}
                  </Link>
                </div>
              </motion.form>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-sm text-center text-white/70 mt-6"
              >
                {t('pages:login.noAccount', "Don't have an account?")}{" "}
                <Link 
                  href="/register" 
                  className="text-white hover:underline font-medium" 
                  data-testid="link-register"
                >
                  {t('pages:login.createAccount', 'Create one now')}
                </Link>
              </motion.p>
            </motion.div>
          </div>
        </div>
      </PublicLayout>
    </SelfHealingErrorBoundary>
  );
}