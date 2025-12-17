import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ChevronRight, ShieldCheck } from "lucide-react";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";

export default function ReportUserPage() {
  return (
    <SelfHealingErrorBoundary pageName="Report User" fallbackRoute="/feed">
      <>
        <SEO
          title="Report User"
          description="Report a user for inappropriate behavior. Help us maintain a safe and respectful community for all members."
        />

        {/* Hero Section - 16:9 */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&auto=format&fit=crop&q=80')`
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
                <AlertTriangle className="w-3 h-3 mr-1.5" />
                User Safety
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
                Report User
              </h1>
              
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Help us keep the community safe by reporting inappropriate behavior
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
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl font-serif">Report Details</CardTitle>
                  </div>
                  <p className="text-base text-muted-foreground leading-relaxed mt-2">
                    Please select a reason and provide additional information
                  </p>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Reason for reporting</Label>
                    <RadioGroup defaultValue="harassment" className="space-y-3">
                      <div className="flex items-center space-x-3 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="harassment" id="harassment" data-testid="radio-harassment" />
                        <Label htmlFor="harassment" className="text-base cursor-pointer flex-1">Harassment or bullying</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="spam" id="spam" data-testid="radio-spam" />
                        <Label htmlFor="spam" className="text-base cursor-pointer flex-1">Spam or misleading</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="inappropriate" id="inappropriate" data-testid="radio-inappropriate" />
                        <Label htmlFor="inappropriate" className="text-base cursor-pointer flex-1">Inappropriate content</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="impersonation" id="impersonation" data-testid="radio-impersonation" />
                        <Label htmlFor="impersonation" className="text-base cursor-pointer flex-1">Impersonation</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="other" id="other" data-testid="radio-other" />
                        <Label htmlFor="other" className="text-base cursor-pointer flex-1">Other</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="details" className="text-base font-semibold">Additional Details</Label>
                    <Textarea
                      id="details"
                      rows={5}
                      placeholder="Please provide any additional information that will help us investigate..."
                      className="mt-2 resize-none"
                      data-testid="input-details"
                    />
                  </div>

                  <div className="bg-muted/50 p-6 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="space-y-2">
                        <p className="font-semibold text-base">Confidential Review Process</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Your report will be reviewed by our moderation team. All reports are confidential and we take appropriate action based on our community guidelines.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full h-12 gap-2" data-testid="button-submit">
                    Submit Report
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
