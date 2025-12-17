import { SEO } from '@/components/SEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DIDVideoWidget } from '@/components/premium/DIDVideoWidget';
import { ElevenLabsWidget } from '@/components/premium/ElevenLabsWidget';
import { CostTrackingWidget } from '@/components/premium/CostTrackingWidget';
import { Sparkles, Crown, Zap } from 'lucide-react';

export default function PremiumFeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <SEO
        title="Premium AI Features - Mundo Tango"
        description="Unlock God Level AI capabilities: D-ID talking avatars, ElevenLabs voice generation, OpenAI realtime voice, and advanced cost tracking."
      />

      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl">
              <Crown className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold" data-testid="heading-premium-features">
                  Premium AI Features
                </h1>
                <Badge variant="default" className="bg-gradient-to-r from-primary to-secondary">
                  God Level
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                Advanced AI-powered content generation and analytics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Cost Tracking (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <CostTrackingWidget />
            </div>
          </div>

          {/* Right Column - Feature Widgets */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="video" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="video" data-testid="tab-video">
                  <Sparkles className="w-4 h-4 mr-2" />
                  D-ID Video
                </TabsTrigger>
                <TabsTrigger value="voice" data-testid="tab-voice">
                  <Zap className="w-4 h-4 mr-2" />
                  ElevenLabs Voice
                </TabsTrigger>
              </TabsList>

              <TabsContent value="video" className="space-y-6">
                <DIDVideoWidget />

                {/* Feature Highlights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">What you can do with D-ID</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>Create talking avatar videos from any photo</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>Generate personalized video messages</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>Produce marketing content with AI presenters</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>Create educational video content at scale</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="voice" className="space-y-6">
                <ElevenLabsWidget />

                {/* Feature Highlights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">What you can do with ElevenLabs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>Generate ultra-realistic text-to-speech in multiple voices</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>Create audiobooks and narrations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>Produce podcast content with AI voices</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>Support multiple languages and accents</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Additional Info */}
            <Card className="mt-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">God Level Subscription Required</h3>
                    <p className="text-sm text-muted-foreground">
                      These premium AI features require an active God Level subscription. 
                      Monthly usage quotas apply to ensure fair use and cost control.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="outline">D-ID: $0.10/video</Badge>
                      <Badge variant="outline">ElevenLabs: $0.30/1000 chars</Badge>
                      <Badge variant="outline">Quota: $100/month</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
