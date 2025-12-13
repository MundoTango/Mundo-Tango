import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { HandHeart, Star, Headphones, Sparkles, PartyPopper } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import tangoHeroImage from "@assets/stock_images/elegant_professional_e4da136e.jpg";

export default function WaitlistPage() {
  const [, navigate] = useLocation();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    
    // Clear the waitlist flag since they've reached this page
    localStorage.removeItem("isWaitlistUser");
    
    // If user is not logged in, redirect to register
    if (!user) {
      navigate("/register");
    }
  }, [user, authLoading, navigate]);

  const userName = user?.name || user?.username || "Dancer";
  const userEmail = user?.email || "";

  return (
    <SelfHealingErrorBoundary pageName="Waitlist" fallbackRoute="/">
      <PublicLayout>
        <SEO
          title="Welcome to the Waitlist - Mundo Tango"
          description="You're on the Mundo Tango waitlist. While you wait, get involved as a volunteer, ambassador, or supporter."
        />

        <div className="relative min-h-screen w-full overflow-hidden" data-testid="hero-waitlist">
          <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${tangoHeroImage})`}}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="w-full max-w-4xl"
            >
              <div className="text-center mb-8">
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-welcome">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Welcome to the Family
                </Badge>
                
                <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-4 tracking-tight leading-tight" data-testid="heading-hero">
                  You're In!
                </h1>
                
                <p className="text-lg text-white/80 max-w-md mx-auto mb-8">
                  Welcome to the Mundo Tango community. We're preparing your account and will notify you soon!
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl"
                data-testid="section-waitlist-success"
              >
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <PartyPopper className="w-10 h-10 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-2">Welcome, {userName}!</h3>
                  <p className="text-white/70">
                    You're on the waitlist. We'll email you at{" "}
                    <span className="text-white font-medium">{userEmail}</span> when your account is ready.
                  </p>
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

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-sm text-center text-white/70 mt-6"
              >
                Have questions?{" "}
                <Link href="/support" className="text-white hover:underline font-medium">
                  Contact Support
                </Link>
              </motion.p>
            </motion.div>
          </div>
        </div>
      </PublicLayout>
    </SelfHealingErrorBoundary>
  );
}
