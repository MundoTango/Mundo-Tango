import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Key, ChevronRight, Mail } from "lucide-react";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { Link } from "wouter";

export default function PasswordResetPage() {
  return (
    <SelfHealingErrorBoundary pageName="Password Reset" fallbackRoute="/login">
      <>
        <SEO
          title="Reset Your Password"
          description="Reset your Mundo Tango password securely. Enter your email and we'll send you a reset link."
        />

        {/* Hero Section - 16:9 */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1600&auto=format&fit=crop&q=80')`
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
                <Key className="w-3 h-3 mr-1.5" />
                Account Security
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
                Reset Your Password
              </h1>
              
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Enter your email and we'll send you a secure reset link
              </p>
            </motion.div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-background py-16 px-6">
          <div className="container mx-auto max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card>
                <CardHeader className="text-center border-b pb-6">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-serif">Enter Your Email</CardTitle>
                  <p className="text-base text-muted-foreground leading-relaxed mt-2">
                    We'll send you instructions to reset your password
                  </p>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div>
                    <Label htmlFor="email" className="text-base">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="you@example.com" 
                      className="mt-2 h-12"
                      data-testid="input-email" 
                    />
                  </div>

                  <Button className="w-full h-12 gap-2" data-testid="button-send">
                    Send Reset Link
                    <ChevronRight className="h-5 w-5" />
                  </Button>

                  <div className="pt-6 border-t">
                    <p className="text-center text-base text-muted-foreground">
                      Remember your password?{" "}
                      <Link href="/login">
                        <a className="text-primary hover:underline font-semibold">
                          Back to login
                        </a>
                      </Link>
                    </p>
                  </div>

                  <div className="bg-muted/50 p-6 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Key className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="space-y-2">
                        <p className="font-semibold text-base">Security Note</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          For your security, the reset link will expire in 1 hour. If you don't receive the email, check your spam folder.
                        </p>
                      </div>
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
