import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, Smartphone, ChevronRight, Lock } from "lucide-react";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";

export default function TwoFactorAuthPage() {
  return (
    <SelfHealingErrorBoundary pageName="Two-Factor Authentication" fallbackRoute="/settings">
      <>
        <SEO
          title="Two-Factor Authentication"
          description="Secure your Mundo Tango account with two-factor authentication. Add an extra layer of protection to your profile."
        />

        {/* Hero Section - 16:9 */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1600&auto=format&fit=crop&q=80')`
            }}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </motion.div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                <Shield className="w-3 h-3 mr-1.5" />
                Enhanced Security
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
                Two-Factor Authentication
              </h1>
              
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Add an extra layer of security to protect your account
              </p>
            </motion.div>
          </div>
        </div>

        {/* Setup Section */}
        <div className="bg-background py-16 px-6">
          <div className="container mx-auto max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Instructions Card */}
              <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
                <CardHeader className="border-b">
                  <CardTitle className="text-2xl font-serif flex items-center gap-3">
                    <Lock className="h-6 w-6 text-primary" />
                    Setup Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <ol className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        1
                      </span>
                      <p className="text-base leading-relaxed pt-1">
                        Download an authenticator app like Google Authenticator or Authy
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        2
                      </span>
                      <p className="text-base leading-relaxed pt-1">
                        Scan the QR code below with your authenticator app
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        3
                      </span>
                      <p className="text-base leading-relaxed pt-1">
                        Enter the 6-digit code from your app to verify
                      </p>
                    </li>
                  </ol>
                </CardContent>
              </Card>

              {/* QR Code Card */}
              <Card>
                <CardHeader className="text-center border-b">
                  <CardTitle className="text-2xl font-serif">Scan QR Code</CardTitle>
                </CardHeader>
                <CardContent className="p-12">
                  <div className="flex justify-center mb-8">
                    <motion.div 
                      className="w-64 h-64 bg-gradient-to-br from-muted to-muted/50 rounded-2xl flex items-center justify-center shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Smartphone className="h-24 w-24 text-muted-foreground/50" />
                    </motion.div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="code" className="text-base">Verification Code</Label>
                      <Input 
                        id="code" 
                        placeholder="000000" 
                        maxLength={6} 
                        className="mt-2 h-12 text-center text-2xl tracking-widest font-mono"
                        data-testid="input-code" 
                      />
                    </div>

                    <Button className="w-full h-12 gap-2" data-testid="button-enable">
                      <Shield className="h-5 w-5" />
                      Enable Two-Factor Authentication
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Security Note */}
              <Card className="bg-muted/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Shield className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <p className="font-semibold text-base">Why Enable 2FA?</p>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="leading-relaxed">Protect your account from unauthorized access</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="leading-relaxed">Add an extra layer of security beyond passwords</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="leading-relaxed">Keep your personal information and connections safe</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
