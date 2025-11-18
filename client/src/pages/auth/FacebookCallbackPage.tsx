import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type CallbackState = 'processing' | 'exchanging' | 'success' | 'error';

export default function FacebookCallbackPage() {
  const [, setLocation] = useLocation();
  const [state, setState] = useState<CallbackState>('processing');
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      console.log('[FacebookCallback] Processing OAuth callback...');
      setState('processing');

      // Get the session from URL hash
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error('[FacebookCallback] Session error:', sessionError);
        throw new Error(sessionError?.message || 'No session found');
      }

      console.log('[FacebookCallback] Session obtained:', {
        user: session.user.email,
        provider: session.user.app_metadata.provider,
      });

      setUserName(session.user.user_metadata.full_name || session.user.email || 'User');

      // Exchange for Page Access Token
      setState('exchanging');
      console.log('[FacebookCallback] Exchanging for Page Access Token...');

      const response = await apiRequest('/api/auth/facebook/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supabaseUserId: session.user.id,
          userAccessToken: session.provider_token,
          email: session.user.email,
          fullName: session.user.user_metadata.full_name,
          facebookUserId: session.user.user_metadata.sub,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to exchange token');
      }

      const data = await response.json();
      console.log('[FacebookCallback] Token exchange successful:', {
        pageId: data.pageId,
        hasToken: !!data.pageAccessToken,
      });

      setState('success');

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        setLocation('/dashboard');
      }, 2000);

    } catch (err) {
      console.error('[FacebookCallback] Error:', err);
      setState('error');
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  const renderContent = () => {
    switch (state) {
      case 'processing':
        return (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <CardTitle>Processing Facebook Login</CardTitle>
            <CardDescription>Please wait while we verify your credentials...</CardDescription>
          </>
        );

      case 'exchanging':
        return (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <CardTitle>Connecting Facebook Page</CardTitle>
            <CardDescription>
              Exchanging credentials for Messenger API access...
              {userName && <div className="mt-2 text-sm">Welcome, {userName}!</div>}
            </CardDescription>
          </>
        );

      case 'success':
        return (
          <>
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <CardTitle>Facebook Connected Successfully!</CardTitle>
            <CardDescription>
              Your Facebook page has been connected. You can now send Messenger invitations.
              <div className="mt-4 text-sm text-muted-foreground">Redirecting to dashboard...</div>
            </CardDescription>
          </>
        );

      case 'error':
        return (
          <>
            <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <CardTitle>Connection Failed</CardTitle>
            <CardDescription>
              {error || 'Unable to connect your Facebook account. Please try again.'}
              <div className="mt-4 flex gap-2 justify-center">
                <Button onClick={() => setLocation('/')} variant="outline">
                  Go Home
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </CardDescription>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {renderContent()}
        </CardHeader>
        <CardContent className="text-center text-xs text-muted-foreground">
          <p>Using official Facebook OAuth for secure authentication</p>
        </CardContent>
      </Card>
    </div>
  );
}
