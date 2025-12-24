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
import { Heart, Sparkles, Users, Loader2, LogIn } from "lucide-react";
import { SiReplit } from "react-icons/si";
import { useQuery } from "@tanstack/react-query";
import tangoHeroImage from "@assets/stock_images/elegant_professional_29e89c1e.jpg";

export default function LoginPage() {
  const { t } = useTranslation(['pages', 'common']);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Get redirect parameter from URL
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
      await login(email, password);
      toast({
        title: t('pages:login.toast.successTitle', 'Welcome back!'),
        description: t('pages:login.toast.successDescription', "You've successfully logged in."),
      });
      // Redirect to the specified URL or default to /feed
      // Use setTimeout to ensure navigation happens after React state updates
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 100);
    } catch (error: any) {
      toast({
        title: t('pages:login.toast.errorTitle', 'Login failed'),
        description: error.message || t('pages:login.toast.errorDescription', 'Invalid credentials'),
        variant: "destructive",
      });
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

        {/* Editorial Hero Section - Full Screen */}
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
              {/* Editorial Header */}
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

                {/* Community Stats - Real data from /api/stats/public */}
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

              {/* Glassmorphic Login Card */}
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

                  <Button
                    type="submit"
                    className="w-full mt-6 bg-white text-black hover:bg-white/90"
                    disabled={isLoading}
                    data-testid="button-login"
                    size="lg"
                  >
                    {isLoading ? t('pages:login.form.signingIn', 'Signing in...') : t('pages:login.form.signIn', 'Sign In')}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-transparent px-2 text-white/60 backdrop-blur-sm">
                        {t('pages:login.form.orContinueWith', 'or continue with')}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-[#0D101E] border-[#F26207] text-white hover:bg-[#F26207]/10 hover:text-white gap-2"
                    onClick={() => window.location.href = '/api/login'}
                    data-testid="button-login-replit"
                    size="lg"
                  >
                    <SiReplit className="w-5 h-5 text-[#F26207]" />
                    {t('pages:login.form.loginWithReplit', 'Login with Replit')}
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
