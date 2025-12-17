import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Globe, Trash2 } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from '@/components/SelfHealingErrorBoundary';
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";

export default function AccountSettingsPage() {
  return (
    <PageLayout title="Account Settings" showBreadcrumbs>
<SelfHealingErrorBoundary pageName="Account Settings" fallbackRoute="/settings">
      <SEO
        title="Account Settings - Mundo Tango"
        description="Manage your Mundo Tango account settings, preferences, and security options."
      />
      
      <div className="container mx-auto max-w-4xl py-12 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4" data-testid="text-page-title">
            Account Settings
          </h1>
          <p className="text-lg text-muted-foreground mb-12">
            Manage your account information, preferences, and security settings
          </p>
        </motion.div>

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <Card className="hover-elevate">
              <CardHeader className="p-8">
                <div className="flex items-center gap-3">
                  <User className="h-6 w-6 text-primary" />
                  <CardTitle className="text-2xl font-serif font-bold">Basic Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-8 pt-0">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue="@johndoe" data-testid="input-username" />
              </div>
              <div>
                <Label htmlFor="display-name">Display Name</Label>
                <Input id="display-name" defaultValue="John Doe" data-testid="input-display-name" />
              </div>
            </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="hover-elevate">
              <CardHeader className="p-8">
                <div className="flex items-center gap-3">
                  <Mail className="h-6 w-6 text-primary" />
                  <CardTitle className="text-2xl font-serif font-bold">Email & Password</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-8 pt-0">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="john@example.com" data-testid="input-email" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="flex gap-2">
                  <Input id="password" type="password" value="••••••••" readOnly />
                  <Button variant="outline" data-testid="button-change-password">Change</Button>
                </div>
              </div>
            </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="hover-elevate">
              <CardHeader className="p-8">
                <div className="flex items-center gap-3">
                  <Globe className="h-6 w-6 text-primary" />
                  <CardTitle className="text-2xl font-serif font-bold">Preferences</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-8 pt-0">
              <div>
                <Label htmlFor="language">Language</Label>
                <Input id="language" defaultValue="English" data-testid="input-language" />
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Input id="timezone" defaultValue="America/New_York" data-testid="input-timezone" />
              </div>
            </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="border-destructive hover-elevate">
              <CardHeader className="p-8">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-6 w-6 text-destructive" />
                  <CardTitle className="text-2xl font-serif font-bold text-destructive">Danger Zone</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button variant="destructive" data-testid="button-delete-account">
                Delete Account
              </Button>
            </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button className="w-full" size="lg" data-testid="button-save">
              Save Changes
            </Button>
          </motion.div>
        </div>
      </div>
    </SelfHealingErrorBoundary>
    </PageLayout>
  );
}
