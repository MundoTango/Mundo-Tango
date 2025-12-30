import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Bug, Lightbulb, HelpCircle, Send, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useJourneyTracker } from '@/hooks/useJourneyTracker';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface FeedbackFormData {
  type: 'bug' | 'feature' | 'support';
  title: string;
  description: string;
}

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'bug' | 'feature' | 'support'>('support');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { user } = useAuth();
  const { getSnapshot, sessionId } = useJourneyTracker(user?.id);
  const { toast } = useToast();
  const { t } = useTranslation(['common']);

  const submitMutation = useMutation({
    mutationFn: async (data: FeedbackFormData) => {
      const snapshot = getSnapshot();
      return apiRequest('POST', '/api/qa/feedback', {
        feedbackType: data.type,
        title: data.title,
        description: data.description,
        currentPage: window.location.pathname,
        sessionId,
        sessionSnapshot: snapshot,
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setTitle('');
        setDescription('');
      }, 2000);
    },
    onError: () => {
      toast({
        title: t('common:error', 'Error'),
        description: t('common:feedback.submitError', 'Failed to submit feedback. Please try again.'),
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        title: t('common:error', 'Error'),
        description: t('common:feedback.titleRequired', 'Please provide a title'),
        variant: 'destructive',
      });
      return;
    }
    submitMutation.mutate({
      type: activeTab,
      title: title.trim(),
      description: description.trim(),
    });
  };

  const tabConfig = {
    support: {
      icon: HelpCircle,
      label: t('common:feedback.support', 'Support'),
      description: t('common:feedback.supportDesc', 'Need help with something?'),
      titlePlaceholder: t('common:feedback.supportTitlePlaceholder', 'What do you need help with?'),
    },
    bug: {
      icon: Bug,
      label: t('common:feedback.bug', 'Bug'),
      description: t('common:feedback.bugDesc', 'Found something broken?'),
      titlePlaceholder: t('common:feedback.bugTitlePlaceholder', 'Describe what went wrong'),
    },
    feature: {
      icon: Lightbulb,
      label: t('common:feedback.feature', 'Feature'),
      description: t('common:feedback.featureDesc', 'Have an idea for us?'),
      titlePlaceholder: t('common:feedback.featureTitlePlaceholder', 'What feature would you like?'),
    },
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
        data-testid="button-feedback"
      >
        <HelpCircle className="h-4 w-4" />
        <span className="hidden sm:inline">{t('common:feedback.title', 'Feedback')}</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <DialogTitle data-testid="text-feedback-success">
                {t('common:feedback.thankYou', 'Thank you for your feedback!')}
              </DialogTitle>
              <DialogDescription>
                {t('common:feedback.successMessage', "We'll review your submission and get back to you.")}
              </DialogDescription>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle data-testid="text-feedback-title">
                  {t('common:feedback.title', 'Send Feedback')}
                </DialogTitle>
                <DialogDescription>
                  {t('common:feedback.description', 'Let us know how we can help')}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                  <TabsList className="grid w-full grid-cols-3">
                    {(['support', 'bug', 'feature'] as const).map((tab) => {
                      const config = tabConfig[tab];
                      const Icon = config.icon;
                      return (
                        <TabsTrigger
                          key={tab}
                          value={tab}
                          className="gap-2"
                          data-testid={`tab-feedback-${tab}`}
                        >
                          <Icon className="h-4 w-4" />
                          {config.label}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  {(['support', 'bug', 'feature'] as const).map((tab) => (
                    <TabsContent key={tab} value={tab} className="space-y-4 mt-4">
                      <p className="text-sm text-muted-foreground">
                        {tabConfig[tab].description}
                      </p>

                      <div className="space-y-2">
                        <Label htmlFor="feedback-title">{t('common:feedback.titleLabel', 'Title')}</Label>
                        <Input
                          id="feedback-title"
                          placeholder={tabConfig[tab].titlePlaceholder}
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          data-testid="input-feedback-title"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="feedback-description">
                          {t('common:feedback.detailsLabel', 'Details (optional)')}
                        </Label>
                        <Textarea
                          id="feedback-description"
                          placeholder={t('common:feedback.detailsPlaceholder', 'Provide any additional details...')}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={4}
                          data-testid="input-feedback-description"
                        />
                      </div>

                      <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                        {t('common:feedback.journeyNote', 'Your current page and navigation history will be included to help us understand the context.')}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    data-testid="button-feedback-cancel"
                  >
                    {t('common:cancel', 'Cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitMutation.isPending}
                    data-testid="button-feedback-submit"
                  >
                    {submitMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {t('common:submit', 'Submit')}
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
