import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageCircle, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted:", formData);
  };

  return (
    <SelfHealingErrorBoundary pageName="Contact" fallbackRoute="/">
    <PageLayout title="Contact Us" showBreadcrumbs>
<PublicLayout>
      <SEO
        title="Contact Us - Mundo Tango"
        description="Get in touch with the Mundo Tango team. We're here to help with questions, feedback, and support for the global tango community."
      />
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        data-testid="input-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        data-testid="input-email"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      data-testid="input-subject"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      data-testid="input-message"
                    />
                  </div>

                  <Button type="submit" className="w-full" data-testid="button-submit">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href="mailto:support@mundotango.com" className="text-sm text-muted-foreground hover:text-primary">
                      support@mundotango.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Live Chat</p>
                    <p className="text-sm text-muted-foreground">Available Mon-Fri, 9AM-6PM EST</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Office</p>
                    <p className="text-sm text-muted-foreground">
                      123 Tango Street<br />
                      Buenos Aires, Argentina
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Frequently Asked</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium text-sm">General Inquiries</p>
                  <p className="text-xs text-muted-foreground">support@mundotango.com</p>
                </div>
                <div>
                  <p className="font-medium text-sm">Business & Partnerships</p>
                  <p className="text-xs text-muted-foreground">partnerships@mundotango.com</p>
                </div>
                <div>
                  <p className="font-medium text-sm">Press & Media</p>
                  <p className="text-xs text-muted-foreground">press@mundotango.com</p>
                </div>
                <div>
                  <p className="font-medium text-sm">Technical Support</p>
                  <p className="text-xs text-muted-foreground">tech@mundotango.com</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6 text-center text-sm text-muted-foreground">
                <p>We typically respond within 24-48 hours during business days.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </PublicLayout>
    </PageLayout>
    </SelfHealingErrorBoundary>);
}
