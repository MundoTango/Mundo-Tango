import { useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function LegalAcceptance() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation(['pages', 'common']);
  const [cocAcceptances, setCocAcceptances] = useState<Record<number, boolean>>({});
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);

  const CODE_OF_CONDUCT_ITEMS = [
    {
      id: 1,
      title: t('pages:onboarding.legal.coc.respectful.title', 'Respectful Behavior'),
      description: t('pages:onboarding.legal.coc.respectful.description', 'Treat all community members with respect, kindness, and empathy')
    },
    {
      id: 2,
      title: t('pages:onboarding.legal.coc.noHarassment.title', 'No Harassment'),
      description: t('pages:onboarding.legal.coc.noHarassment.description', 'Zero tolerance for harassment, bullying, or intimidation in any form')
    },
    {
      id: 3,
      title: t('pages:onboarding.legal.coc.noDiscrimination.title', 'No Discrimination'),
      description: t('pages:onboarding.legal.coc.noDiscrimination.description', 'Respect all individuals regardless of race, gender, religion, or background')
    },
    {
      id: 4,
      title: t('pages:onboarding.legal.coc.consent.title', 'Consent Required'),
      description: t('pages:onboarding.legal.coc.consent.description', 'Always obtain clear consent before physical contact or sharing personal information')
    },
    {
      id: 5,
      title: t('pages:onboarding.legal.coc.safety.title', 'Safety First'),
      description: t('pages:onboarding.legal.coc.safety.description', 'Prioritize the safety and well-being of yourself and others at all times')
    },
    {
      id: 6,
      title: t('pages:onboarding.legal.coc.authentic.title', 'Authentic Identity'),
      description: t('pages:onboarding.legal.coc.authentic.description', 'Use your real identity and provide accurate information in your profile')
    },
    {
      id: 7,
      title: t('pages:onboarding.legal.coc.noSpam.title', 'No Commercial Spam'),
      description: t('pages:onboarding.legal.coc.noSpam.description', 'Do not use the platform for unsolicited commercial advertising or spam')
    },
    {
      id: 8,
      title: t('pages:onboarding.legal.coc.privacy.title', 'Respect Privacy'),
      description: t('pages:onboarding.legal.coc.privacy.description', 'Respect the privacy of others and do not share their personal information')
    },
    {
      id: 9,
      title: t('pages:onboarding.legal.coc.report.title', 'Report Issues'),
      description: t('pages:onboarding.legal.coc.report.description', 'Report any violations or concerns to our moderation team promptly')
    },
    {
      id: 10,
      title: t('pages:onboarding.legal.coc.laws.title', 'Follow Local Laws'),
      description: t('pages:onboarding.legal.coc.laws.description', 'Comply with all applicable local, national, and international laws')
    },
    {
      id: 11,
      title: t('pages:onboarding.legal.coc.inclusive.title', 'Be Inclusive'),
      description: t('pages:onboarding.legal.coc.inclusive.description', 'Foster an inclusive environment that welcomes dancers of all skill levels')
    },
    {
      id: 12,
      title: t('pages:onboarding.legal.coc.support.title', 'Support Community'),
      description: t('pages:onboarding.legal.coc.support.description', 'Contribute positively to the tango community and help others grow')
    }
  ];

  const acceptMutation = useMutation({
    mutationFn: () => apiRequest('/api/onboarding/legal', 'POST', {
      privacyPolicyVersion: '1.0',
      tosVersion: '1.0',
      cocVersion: '1.0'
    }),
    onSuccess: () => {
      toast({
        title: t('pages:onboarding.legal.success.title', 'Legal agreements accepted'),
        description: t('pages:onboarding.legal.success.description', 'You can now continue with your onboarding'),
      });
      setLocation('/');
    },
    onError: (error: any) => {
      toast({
        title: t('pages:onboarding.legal.errors.failed', 'Failed to accept agreements'),
        description: error.message || t('common:errors.tryAgain', 'Please try again'),
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
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight" data-testid="heading-legal-acceptance">
            {t('pages:onboarding.legal.title', 'Community Guidelines')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('pages:onboarding.legal.subtitle', 'Welcome to Mundo Tango! Please review and accept our community guidelines to continue.')}
          </p>
        </div>

        <Card data-testid="card-code-of-conduct">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              {t('pages:onboarding.legal.cocTitle', 'Code of Conduct')}
            </CardTitle>
            <CardDescription>
              {t('pages:onboarding.legal.cocDescription', 'Our community standards ensure a safe, respectful, and welcoming environment for all dancers')}
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

        <Card data-testid="card-legal-documents">
          <CardHeader>
            <CardTitle>{t('pages:onboarding.legal.legalDocsTitle', 'Legal Documents')}</CardTitle>
            <CardDescription>
              {t('pages:onboarding.legal.legalDocsDescription', 'Please review and accept our legal agreements')}
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
                  {t('pages:onboarding.legal.privacyPolicy.label', 'Privacy Policy (v1.0)')}
                </label>
                <p className="text-sm text-muted-foreground">
                  {t('pages:onboarding.legal.privacyPolicy.description', 'I have read and agree to the')}{' '}
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    className="text-primary hover:underline"
                    data-testid="link-privacy-policy"
                  >
                    {t('pages:onboarding.legal.privacyPolicy.link', 'Privacy Policy')}
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
                  {t('pages:onboarding.legal.termsOfService.label', 'Terms of Service (v1.0)')}
                </label>
                <p className="text-sm text-muted-foreground">
                  {t('pages:onboarding.legal.termsOfService.description', 'I have read and agree to the')}{' '}
                  <a
                    href="/terms"
                    target="_blank"
                    className="text-primary hover:underline"
                    data-testid="link-terms-of-service"
                  >
                    {t('pages:onboarding.legal.termsOfService.link', 'Terms of Service')}
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {!allAccepted && (
          <Alert data-testid="alert-incomplete">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('pages:onboarding.legal.incompleteAlert', 'Please accept all 12 Code of Conduct items, Privacy Policy, and Terms of Service to continue')}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardFooter className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => setLocation('/login')}
              data-testid="button-back"
            >
              {t('common:buttons.back', 'Back')}
            </Button>
            <Button
              onClick={handleAcceptAll}
              disabled={!allAccepted || acceptMutation.isPending}
              data-testid="button-accept-legal"
            >
              {acceptMutation.isPending ? t('pages:onboarding.legal.accepting', 'Accepting...') : t('pages:onboarding.legal.acceptAll', 'I Accept All Terms')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
