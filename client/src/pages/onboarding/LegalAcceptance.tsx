import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const CODE_OF_CONDUCT_ITEMS = [
  {
    id: 1,
    title: 'Respectful Behavior',
    description: 'Treat all community members with respect, kindness, and empathy'
  },
  {
    id: 2,
    title: 'No Harassment',
    description: 'Zero tolerance for harassment, bullying, or intimidation in any form'
  },
  {
    id: 3,
    title: 'No Discrimination',
    description: 'Respect all individuals regardless of race, gender, religion, or background'
  },
  {
    id: 4,
    title: 'Consent Required',
    description: 'Always obtain clear consent before physical contact or sharing personal information'
  },
  {
    id: 5,
    title: 'Safety First',
    description: 'Prioritize the safety and well-being of yourself and others at all times'
  },
  {
    id: 6,
    title: 'Authentic Identity',
    description: 'Use your real identity and provide accurate information in your profile'
  },
  {
    id: 7,
    title: 'No Commercial Spam',
    description: 'Do not use the platform for unsolicited commercial advertising or spam'
  },
  {
    id: 8,
    title: 'Respect Privacy',
    description: 'Respect the privacy of others and do not share their personal information'
  },
  {
    id: 9,
    title: 'Report Issues',
    description: 'Report any violations or concerns to our moderation team promptly'
  },
  {
    id: 10,
    title: 'Follow Local Laws',
    description: 'Comply with all applicable local, national, and international laws'
  },
  {
    id: 11,
    title: 'Be Inclusive',
    description: 'Foster an inclusive environment that welcomes dancers of all skill levels'
  },
  {
    id: 12,
    title: 'Support Community',
    description: 'Contribute positively to the tango community and help others grow'
  }
];

export default function LegalAcceptance() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [cocAcceptances, setCocAcceptances] = useState<Record<number, boolean>>({});
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);

  const acceptMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/onboarding/legal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privacyPolicyVersion: '1.0',
          tosVersion: '1.0',
          cocVersion: '1.0'
        })
      });
    },
    onSuccess: () => {
      toast({
        title: 'Legal agreements accepted',
        description: 'You can now continue with your onboarding',
      });
      setLocation('/');
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to accept agreements',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    }
  });

  const allCocAccepted = CODE_OF_CONDUCT_ITEMS.every(item => cocAcceptances[item.id]);
  const allAccepted = allCocAccepted && privacyAccepted && tosAccepted;

  const handleCocToggle = (id: number, checked: boolean) => {
    setCocAcceptances(prev => ({ ...prev, [id]: checked }));
  };

  const handleAcceptAll = () => {
    acceptMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight" data-testid="heading-legal-acceptance">
            Community Guidelines
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Welcome to Mundo Tango! Please review and accept our community guidelines to continue.
          </p>
        </div>

        {/* Code of Conduct */}
        <Card data-testid="card-code-of-conduct">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Code of Conduct
            </CardTitle>
            <CardDescription>
              Our community standards ensure a safe, respectful, and welcoming environment for all dancers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-y-auto pr-4">
              <div className="space-y-4">
                {CODE_OF_CONDUCT_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-4 rounded-lg border bg-card hover-elevate"
                    data-testid={`coc-item-${item.id}`}
                  >
                    <Checkbox
                      id={`coc-${item.id}`}
                      checked={cocAcceptances[item.id] || false}
                      onCheckedChange={(checked) => handleCocToggle(item.id, checked as boolean)}
                      data-testid={`checkbox-coc-${item.id}`}
                    />
                    <div className="flex-1 space-y-1">
                      <label
                        htmlFor={`coc-${item.id}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {item.id}. {item.title}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Documents */}
        <Card data-testid="card-legal-documents">
          <CardHeader>
            <CardTitle>Legal Documents</CardTitle>
            <CardDescription>
              Please review and accept our legal agreements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <Checkbox
                id="privacy-policy"
                checked={privacyAccepted}
                onCheckedChange={(checked) => setPrivacyAccepted(checked as boolean)}
                data-testid="checkbox-privacy-policy"
              />
              <div className="flex-1 space-y-1">
                <label
                  htmlFor="privacy-policy"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Privacy Policy (v1.0)
                </label>
                <p className="text-sm text-muted-foreground">
                  I have read and agree to the{' '}
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    className="text-primary hover:underline"
                    data-testid="link-privacy-policy"
                  >
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <Checkbox
                id="terms-of-service"
                checked={tosAccepted}
                onCheckedChange={(checked) => setTosAccepted(checked as boolean)}
                data-testid="checkbox-terms-of-service"
              />
              <div className="flex-1 space-y-1">
                <label
                  htmlFor="terms-of-service"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Terms of Service (v1.0)
                </label>
                <p className="text-sm text-muted-foreground">
                  I have read and agree to the{' '}
                  <a
                    href="/terms"
                    target="_blank"
                    className="text-primary hover:underline"
                    data-testid="link-terms-of-service"
                  >
                    Terms of Service
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Alert */}
        {!allAccepted && (
          <Alert data-testid="alert-incomplete">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please accept all {CODE_OF_CONDUCT_ITEMS.length} Code of Conduct items, Privacy Policy, and Terms of Service to continue
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <Card>
          <CardFooter className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => setLocation('/login')}
              data-testid="button-back"
            >
              Back
            </Button>
            <Button
              onClick={handleAcceptAll}
              disabled={!allAccepted || acceptMutation.isPending}
              data-testid="button-accept-legal"
            >
              {acceptMutation.isPending ? 'Accepting...' : 'I Accept All Terms'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
