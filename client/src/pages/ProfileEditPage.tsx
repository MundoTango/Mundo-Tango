import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, User, MapPin, Link as LinkIcon, Save } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";

export default function ProfileEditPage() {
  return (
    <SelfHealingErrorBoundary pageName="Profile Edit" fallbackRoute="/profile">
      <PageLayout title="Edit Profile" showBreadcrumbs>
        <>
          <SEO 
            title="Edit Profile - Mundo Tango"
            description="Update your profile information and preferences"
          />

          {/* Hero Section - 16:9 */}
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1496284045406-d3e0b918d7ba?w=1600&auto=format&fit=crop')`
            }}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                  <User className="w-3 h-3 mr-1.5" />
                  Personalize
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
                  Edit Your Profile
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                  Make your profile shine in the tango community
                </p>
              </motion.div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-background py-12 px-6">
            <div className="container mx-auto max-w-2xl space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-2xl font-serif">Profile Picture</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-24 w-24 border-2 border-primary/20">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-2xl">JD</AvatarFallback>
                      </Avatar>
                      <Button variant="outline" className="gap-2" data-testid="button-change-photo">
                        <Camera className="h-4 w-4" />
                        Change Photo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-2xl font-serif">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="first-name" className="text-base font-medium">First Name</Label>
                        <Input id="first-name" defaultValue="John" data-testid="input-first-name" className="h-12" />
                      </div>
                      <div>
                        <Label htmlFor="last-name" className="text-base font-medium">Last Name</Label>
                        <Input id="last-name" defaultValue="Doe" data-testid="input-last-name" className="h-12" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio" className="text-base font-medium">Bio</Label>
                      <Textarea
                        id="bio"
                        rows={4}
                        placeholder="Tell us about yourself..."
                        defaultValue="Passionate tango dancer from New York"
                        data-testid="input-bio"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location" className="text-base font-medium">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Location
                        </div>
                      </Label>
                      <Input id="location" defaultValue="New York, NY" data-testid="input-location" className="h-12" />
                    </div>

                    <div>
                      <Label htmlFor="website" className="text-base font-medium">
                        <div className="flex items-center gap-2">
                          <LinkIcon className="h-4 w-4" />
                          Website
                        </div>
                      </Label>
                      <Input id="website" type="url" placeholder="https://" data-testid="input-website" className="h-12" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="overflow-hidden bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-2xl font-serif">Tango Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="level" className="text-base font-medium">Dance Level</Label>
                      <Input id="level" defaultValue="Intermediate" data-testid="input-level" className="h-12" />
                    </div>
                    <div>
                      <Label htmlFor="role" className="text-base font-medium">Preferred Role</Label>
                      <Input id="role" defaultValue="Both" data-testid="input-role" className="h-12" />
                    </div>
                    <div>
                      <Label htmlFor="experience" className="text-base font-medium">Years of Experience</Label>
                      <Input id="experience" type="number" defaultValue="3" data-testid="input-experience" className="h-12" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Button className="w-full gap-2" size="lg" data-testid="button-save">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </motion.div>
            </div>
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
