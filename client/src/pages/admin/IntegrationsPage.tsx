import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Facebook, Mail, Webhook, Key, CheckCircle, XCircle, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { SiFacebook, SiGoogle, SiStripe } from 'react-icons/si';

interface Integration {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: Date;
  apiKey?: string;
}

export default function IntegrationsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: integrations, isLoading } = useQuery<Integration[]>({
    queryKey: ['/api/admin/integrations'],
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      return apiRequest(`/api/admin/integrations/${integrationId}/test`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Connection Successful',
        description: 'Integration is working correctly.',
      });
    },
    onError: () => {
      toast({
        title: 'Connection Failed',
        description: 'Unable to connect to the integration.',
        variant: 'destructive',
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" data-testid={`badge-connected`}><CheckCircle className="h-3 w-3 mr-1" />Connected</Badge>;
      case 'error':
        return <Badge variant="destructive" data-testid={`badge-error`}><XCircle className="h-3 w-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="outline" data-testid={`badge-disconnected`}>Disconnected</Badge>;
    }
  };

  return (
    <div className="space-y-8" data-testid="page-integrations">
      <div>
        <h1 className="text-3xl font-bold">Integrations Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage third-party integrations and API keys
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">
            Overview
          </TabsTrigger>
          <TabsTrigger value="stripe" data-testid="tab-stripe">
            <CreditCard className="h-4 w-4 mr-2" />
            Stripe
          </TabsTrigger>
          <TabsTrigger value="social" data-testid="tab-social">
            <Facebook className="h-4 w-4 mr-2" />
            Social
          </TabsTrigger>
          <TabsTrigger value="webhooks" data-testid="tab-webhooks">
            <Webhook className="h-4 w-4 mr-2" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card data-testid="card-stripe-integration">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SiStripe className="h-6 w-6" />
                    <CardTitle>Stripe</CardTitle>
                  </div>
                  {getStatusBadge('connected')}
                </div>
                <CardDescription>Payment processing integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last synced</span>
                  <span>2 minutes ago</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => testConnectionMutation.mutate('stripe')}
                  data-testid="button-test-stripe"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="card-facebook-integration">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SiFacebook className="h-6 w-6" />
                    <CardTitle>Facebook</CardTitle>
                  </div>
                  {getStatusBadge('connected')}
                </div>
                <CardDescription>Social login and event import</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last synced</span>
                  <span>1 hour ago</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => testConnectionMutation.mutate('facebook')}
                  data-testid="button-test-facebook"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="card-google-integration">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SiGoogle className="h-6 w-6" />
                    <CardTitle>Google</CardTitle>
                  </div>
                  {getStatusBadge('connected')}
                </div>
                <CardDescription>OAuth and Calendar sync</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last synced</span>
                  <span>30 minutes ago</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => testConnectionMutation.mutate('google')}
                  data-testid="button-test-google"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="card-email-integration">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-6 w-6" />
                    <CardTitle>Email Service</CardTitle>
                  </div>
                  {getStatusBadge('connected')}
                </div>
                <CardDescription>SMTP email delivery</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last email sent</span>
                  <span>5 minutes ago</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => testConnectionMutation.mutate('email')}
                  data-testid="button-test-email"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stripe" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stripe Configuration</CardTitle>
              <CardDescription>Payment processing settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stripePublishableKey">Publishable Key</Label>
                <Input
                  id="stripePublishableKey"
                  placeholder="pk_live_..."
                  type="password"
                  data-testid="input-stripe-publishable"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stripeSecretKey">Secret Key</Label>
                <Input
                  id="stripeSecretKey"
                  placeholder="sk_live_..."
                  type="password"
                  data-testid="input-stripe-secret"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stripeWebhookSecret">Webhook Secret</Label>
                <Input
                  id="stripeWebhookSecret"
                  placeholder="whsec_..."
                  type="password"
                  data-testid="input-stripe-webhook"
                />
              </div>

              <Button data-testid="button-save-stripe">
                <Key className="h-4 w-4 mr-2" />
                Save Stripe Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Login Providers</CardTitle>
              <CardDescription>Configure OAuth providers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <SiFacebook className="h-5 w-5" />
                    <Label>Facebook Login</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Allow users to sign in with Facebook
                  </p>
                </div>
                <Switch defaultChecked data-testid="switch-facebook-login" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <SiGoogle className="h-5 w-5" />
                    <Label>Google Login</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Allow users to sign in with Google
                  </p>
                </div>
                <Switch defaultChecked data-testid="switch-google-login" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Endpoints</CardTitle>
              <CardDescription>Configure webhook URLs for events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  placeholder="https://your-app.com/webhooks"
                  data-testid="input-webhook-url"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhookSecret">Webhook Secret</Label>
                <Input
                  id="webhookSecret"
                  type="password"
                  placeholder="Enter secret key"
                  data-testid="input-webhook-secret"
                />
              </div>

              <Button data-testid="button-save-webhook">
                <Webhook className="h-4 w-4 mr-2" />
                Save Webhook Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
