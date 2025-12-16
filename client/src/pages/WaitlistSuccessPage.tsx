import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { PublicLayout } from "@/components/PublicLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import { PartyPopper, HandHeart, CreditCard, ArrowRight, Sparkles } from "lucide-react";
import tangoHeroImage from "@assets/stock_images/elegant_professional_e4da136e.jpg";
import { useState } from "react";
import { TalentMatchModal } from "@/components/TalentMatchModal";
import { useAuth } from "@/contexts/AuthContext";

export default function WaitlistSuccessPage() {
  const [talentMatchOpen, setTalentMatchOpen] = useState(false);
  const { user } = useAuth();

  return (
    <SelfHealingErrorBoundary pageName="WaitlistSuccess" fallbackRoute="/">
      <PublicLayout>
        <SEO
          title="Welcome to the Waitlist - Mundo Tango"
          description="You're on the Mundo Tango waitlist. We'll notify you when your account is ready."
        />

        <div className="relative min-h-screen w-full overflow-hidden" data-testid="hero-waitlist-success">
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
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <PartyPopper className="w-10 h-10 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-2">Welcome, {user?.name || "Dancer"}!</h3>
                  <p className="text-white/70 mb-8">You're on the list. We'll email you at <span className="text-white font-medium">{user?.email}</span> when your account is ready.</p>
                  
                  <div className="space-y-4">
                    <p className="text-sm text-white/60 font-medium uppercase tracking-wide">While you wait, help us grow</p>
                    <div className="flex flex-col gap-3">
                      <Button 
                        className="w-full bg-white text-black hover:bg-white/90"
                        size="lg"
                        onClick={() => setTalentMatchOpen(true)}
                        data-testid="button-volunteer-cta"
                      >
                        <HandHeart className="mr-2 h-5 w-5" />
                        Volunteer with us
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
                          Support Mundo Tango
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  <TalentMatchModal 
                    open={talentMatchOpen}
                    onOpenChange={setTalentMatchOpen}
                    initialName={user?.name}
                    initialEmail={user?.email}
                  />
                </div>
              </motion.div>

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
