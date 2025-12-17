import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, ExternalLink, Shield, Key, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';

interface Integration {
  name: string;
  displayName: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  provider: string;
  scopes?: string[];
  expiresAt?: string;
  lastConnected?: string;
  required: boolean;
  icon: string;
}

export default function IntegrationsPage() {
  const { toast } = useToast();

  const { data: integrations, isLoading } = useQuery<Integration[]>({
    queryKey: ['/api/admin/integrations'],
  });

  const connectMutation = useMutation({
    mutationFn: async (provider: string) => {
      // Initiate OAuth flow
      const result = await apiRequest(`/api/admin/integrations/${provider}/connect`, {
        method: 'POST',
      });
      
      // Redirect to OAuth provider
      if (result.authUrl) {
        window.location.href = result.authUrl;
      }
      
      return result;
    },
    onError: (error: Error) => {
      toast({
        title: 'Connection Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (provider: string) => {
      return await apiRequest(`/api/admin/integrations/${provider}/disconnect`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/integrations'] });
      toast({
        title: 'Disconnected',
        description: 'Integration disconnected successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Disconnection Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading integrations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Platform Integrations</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Connect your accounts to enable AI automation and messaging features
        </p>
      </div>

      {/* Warning Banner */}
      <Card className="mb-6 border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
        <CardHeader>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <CardTitle className="text-base text-yellow-800 dark:text-yellow-200">
                Authorization Required for AI Features
              </CardTitle>
              <CardDescription className="text-yellow-700 dark:text-yellow-300 mt-1">
                Mr. Blue AI assistant needs your permission to send messages and automate tasks on your behalf.
                Connect the platforms below to enable these features.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Integrations Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Facebook Integration */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-lg">Facebook Messenger</CardTitle>
                  <CardDescription>Send messages via official Graph API</CardDescription>
                </div>
              </div>
              <StatusIcon status={integrations?.find(i => i.provider === 'facebook')?.status || 'disconnected'} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">Enables:</p>
                <ul className="space-y-1 ml-4">
                  <li className="flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    Send Facebook messages automatically
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    Natural language commands (e.g., "Send FB invite to...")
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    Page Access Token management
                  </li>
                </ul>
              </div>

              {integrations?.find(i => i.provider === 'facebook')?.status === 'connected' ? (
                <div className="space-y-2">
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    Last connected: {new Date(integrations.find(i => i.provider === 'facebook')!.lastConnected!).toLocaleString()}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => disconnectMutation.mutate('facebook')}
                    data-testid="button-disconnect-facebook"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => connectMutation.mutate('facebook')}
                  disabled={connectMutation.isPending}
                  data-testid="button-connect-facebook"
                >
                  <Key className="h-4 w-4 mr-2" />
                  {connectMutation.isPending ? 'Connecting...' : 'Connect Facebook'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Supabase Integration */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950">
                  <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.894 19.867l-5.394-5.394 8.485-8.485 2.828 2.828-5.919 10.051z"/>
                    <path d="M10.106 4.133l5.394 5.394-8.485 8.485-2.828-2.828 5.919-10.051z"/>
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-lg">Supabase (Optional)</CardTitle>
                  <CardDescription>Real-time features & backup auth</CardDescription>
                </div>
              </div>
              <StatusIcon status={integrations?.find(i => i.provider === 'supabase')?.status || 'disconnected'} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">Enables:</p>
                <ul className="space-y-1 ml-4">
                  <li className="flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    Real-time WebSocket features
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    Backup authentication (if self-hosted fails)
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    User profile synchronization
                  </li>
                </ul>
              </div>

              {integrations?.find(i => i.provider === 'supabase')?.status === 'connected' ? (
                <div className="space-y-2">
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => disconnectMutation.mutate('supabase')}
                    data-testid="button-disconnect-supabase"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <>
                  <Badge variant="secondary">Optional - Account Currently Flagged</Badge>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => connectMutation.mutate('supabase')}
                    disabled={true}
                    data-testid="button-connect-supabase"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Connect Supabase (Awaiting Recovery)
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* GitHub Integration */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <svg className="h-6 w-6 text-gray-800 dark:text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-lg">GitHub (Optional)</CardTitle>
                  <CardDescription>Repository access & CI/CD</CardDescription>
                </div>
              </div>
              <StatusIcon status={integrations?.find(i => i.provider === 'github')?.status || 'disconnected'} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">Enables:</p>
                <ul className="space-y-1 ml-4">
                  <li className="flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    Repository access for AI agent
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    Automated deployments
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    Code synchronization
                  </li>
                </ul>
              </div>

              {integrations?.find(i => i.provider === 'github')?.status === 'connected' ? (
                <div className="space-y-2">
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => disconnectMutation.mutate('github')}
                    data-testid="button-disconnect-github"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <>
                  <Badge variant="secondary">Optional - Account Currently Flagged</Badge>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => connectMutation.mutate('github')}
                    disabled={true}
                    data-testid="button-connect-github"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Connect GitHub (Fix 2FA First)
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gmail Integration (Replit) */}
        <Card className="border-2 border-green-500/50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-950">
                  <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-lg">Gmail (Replit Native)</CardTitle>
                  <CardDescription>Send emails via Replit integration</CardDescription>
                </div>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">Enables:</p>
                <ul className="space-y-1 ml-4">
                  <li className="flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    Send support emails
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    User notifications
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    Contact platform support
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected via Replit
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Managed by Replit Connectors (no setup needed)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documentation Link */}
      <Card className="mt-6 border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <ExternalLink className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Need Help?
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                See <code className="bg-blue-200 dark:bg-blue-900 px-1 py-0.5 rounded">docs/MB_MD_V9_ULTIMATE_RESILIENT_ARCHITECTURE.md</code> for complete setup instructions and troubleshooting.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
