import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

export function ScottWelcomeScreen() {
  const [, setLocation] = useLocation();
  
  const startPlanMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/the-plan/start', {
        method: 'POST'
      });
    },
    onSuccess: () => {
      setLocation('/dashboard');
    }
  });
  
  const skipToDashboardMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/the-plan/skip', {
        method: 'POST'
      });
    },
    onSuccess: () => {
      setLocation('/dashboard');
    }
  });
  
  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
      data-testid="scott-welcome-screen"
    >
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-primary animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-background" />
            </div>
          </div>
          <h1 className="text-3xl font-bold" data-testid="welcome-title">
            Welcome to Mundo Tango, Scott! 🎉
          </h1>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-lg leading-relaxed" data-testid="welcome-message">
            <p className="mb-4">
              Hey Scott! I'm Mr. Blue, your AI companion. I know your entire story—
              from teaching tango in South Korea to building this global platform 
              to connect the tango community worldwide.
            </p>
            
            <p className="mb-4">
              Since you're the <strong>FIRST user</strong>, I'm going to guide you through <strong>The Plan</strong>—
              a complete tour of Mundo Tango where we'll test every feature together.
            </p>
            
            <p className="mb-4">
              As we go page by page, I'll validate everything matches your vision 
              from Parts 1-10 and self-heal any issues we find.
            </p>
            
            <p className="font-semibold text-primary">
              Ready to see what we've built? Let's dance! 💃🕺
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex gap-3 justify-center">
          <Button 
            size="lg"
            onClick={() => startPlanMutation.mutate()}
            disabled={startPlanMutation.isPending}
            data-testid="button-start-plan"
          >
            {startPlanMutation.isPending ? 'Starting...' : 'Start The Plan'}
          </Button>
          
          <Button 
            size="lg"
            variant="outline"
            onClick={() => skipToDashboardMutation.mutate()}
            disabled={skipToDashboardMutation.isPending}
            data-testid="button-skip-dashboard"
          >
            Skip to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
