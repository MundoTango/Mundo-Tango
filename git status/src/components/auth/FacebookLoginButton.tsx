import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Facebook, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FacebookLoginButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  onSuccess?: () => void;
}

export function FacebookLoginButton({ 
  variant = 'default', 
  size = 'default',
  className = '',
  onSuccess 
}: FacebookLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFacebookLogin = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          scopes: 'public_profile,email,pages_messaging,pages_manage_metadata,pages_show_list',
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            display: 'popup',
          },
        },
      });

      if (error) {
        console.error('[FacebookLoginButton] OAuth error:', error);
        toast({
          title: 'Authentication Failed',
          description: error.message || 'Unable to connect with Facebook. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      console.log('[FacebookLoginButton] OAuth initiated:', data);
      
      // Supabase will redirect to Facebook, then back to /auth/callback
      // No need to call onSuccess here - will be called in callback page
      
    } catch (err) {
      console.error('[FacebookLoginButton] Unexpected error:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleFacebookLogin}
      disabled={isLoading}
      data-testid="button-facebook-login"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Facebook className="mr-2 h-4 w-4" />
          Connect Facebook
        </>
      )}
    </Button>
  );
}
