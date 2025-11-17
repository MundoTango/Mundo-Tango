import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Sparkles, ArrowRight, ArrowLeft, Smile, Frown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  content: React.ReactNode;
}

export default function OnboardingPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [sentiment, setSentiment] = useState<'positive' | 'neutral' | 'negative'>('neutral');
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Mr Blue',
      description: 'Your AI-powered development assistant',
      completed: completedSteps.has('welcome'),
      content: (
        <div className="space-y-4">
          <div className="text-center py-8">
            <Sparkles className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Hello! I'm Mr Blue</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              I'm here to help you build amazing things faster. Let me show you what I can do!
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'chat',
      title: 'Text Chat',
      description: 'Have conversations in natural language',
      completed: completedSteps.has('chat'),
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Natural Language Chat</h3>
          <p className="text-muted-foreground">
            Ask me anything about your code, get explanations, or request help with tasks.
          </p>
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">Try asking:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>"Explain this code to me"</li>
              <li>"How do I implement authentication?"</li>
              <li>"Find bugs in my function"</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'voice',
      title: 'Voice Mode',
      description: 'Talk to me hands-free',
      completed: completedSteps.has('voice'),
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Voice Conversations</h3>
          <p className="text-muted-foreground">
            Use voice commands to code faster. I'll transcribe your speech and respond with voice.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Available modes:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Push-to-talk:</strong> Hold button to speak</li>
              <li>• <strong>Hands-free:</strong> Continuous listening</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'vibecoding',
      title: 'Vibecoding',
      description: 'Generate code from descriptions',
      completed: completedSteps.has('vibecoding'),
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">AI Code Generation</h3>
          <p className="text-muted-foreground">
            Describe what you want in plain English, and I'll write the code for you.
          </p>
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">Example:</p>
            <div className="text-sm bg-background p-3 rounded border">
              "Create a React component that displays a user profile card with avatar, name, and bio"
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'visual-editor',
      title: 'Visual Editor',
      description: 'Point, click, and edit your UI',
      completed: completedSteps.has('visual-editor'),
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Visual UI Editing</h3>
          <p className="text-muted-foreground">
            Select elements on your page and edit them visually. No need to hunt through code files.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm">Features:</p>
            <ul className="text-sm text-muted-foreground space-y-1 mt-2">
              <li>• Click to select any element</li>
              <li>• Edit properties in real-time</li>
              <li>• Undo/redo support</li>
              <li>• Git integration</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'complete',
      title: 'You're All Set!',
      description: 'Start building with Mr Blue',
      completed: completedSteps.has('complete'),
      content: (
        <div className="space-y-4">
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold mb-2">Ready to Go!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              You've completed the onboarding. Start using Mr Blue to supercharge your development!
            </p>
          </div>
        </div>
      ),
    },
  ];

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/mrblue/onboarding/complete', {
        method: 'POST',
        body: JSON.stringify({ completedSteps: Array.from(completedSteps), sentiment }),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Onboarding Complete!',
        description: 'You can now use all Mr Blue features.',
      });
      setLocation('/mrblue/chat');
    },
  });

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, steps[currentStep].id]));
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboardingMutation.mutate();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    completeOnboardingMutation.mutate();
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="container mx-auto py-8" data-testid="page-mr-blue-onboarding">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" data-testid="badge-progress">
              Step {currentStep + 1} of {steps.length}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleSkip} data-testid="button-skip">
              Skip Tour
            </Button>
          </div>
          <Progress value={progress} className="mb-4" data-testid="progress-bar" />
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="min-h-[300px]" data-testid="step-content">
            {steps[currentStep].content}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setSentiment('positive')}
                className={sentiment === 'positive' ? 'bg-accent' : ''}
                data-testid="button-sentiment-positive"
              >
                <Smile className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => setSentiment('negative')}
                className={sentiment === 'negative' ? 'bg-accent' : ''}
                data-testid="button-sentiment-negative"
              >
                <Frown className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleNext} data-testid="button-next">
                {currentStep === steps.length - 1 ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex justify-center gap-2 pt-4">
            {steps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(idx)}
                className="transition-all"
                data-testid={`step-indicator-${idx}`}
              >
                {completedSteps.has(step.id) ? (
                  <CheckCircle className="h-6 w-6 text-primary" />
                ) : idx === currentStep ? (
                  <Circle className="h-6 w-6 text-primary fill-primary" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
