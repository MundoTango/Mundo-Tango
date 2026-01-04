import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Send, Loader2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface ClarificationQuestion {
  question: string;
  reasoning: string;
  category?: string;
}

export interface ClarificationDialogProps {
  open: boolean;
  questions: ClarificationQuestion[];
  confidence: number;
  roundNumber: number;
  maxRounds?: number;
  onAnswer: (answers: string[]) => void;
  onClose?: () => void;
  isLoading?: boolean;
}

export function ClarificationDialog({
  open,
  questions,
  confidence,
  roundNumber,
  maxRounds = 3,
  onAnswer,
  onClose,
  isLoading = false,
}: ClarificationDialogProps) {
  const [answers, setAnswers] = useState<string[]>(new Array(questions.length).fill(''));
  const [isRecording, setIsRecording] = useState<number | null>(null);
  const { toast } = useToast();

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleVoiceInput = (index: number) => {
    if (isRecording === index) {
      setIsRecording(null);
      toast({
        title: 'Voice input stopped',
        description: 'Processing your voice input...',
      });
    } else {
      setIsRecording(index);
      toast({
        title: 'Voice input started',
        description: 'Speak your answer now',
      });
    }
  };

  const handleSubmit = () => {
    const filledAnswers = answers.filter(a => a.trim() !== '');
    if (filledAnswers.length === 0) {
      toast({
        title: 'No answers provided',
        description: 'Please answer at least one question',
        variant: 'destructive',
      });
      return;
    }

    onAnswer(answers);
    setAnswers(new Array(questions.length).fill(''));
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const confidencePercentage = Math.round(confidence * 100);
  const shouldAutoContinue = confidence >= 0.8;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="dialog-clarification">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between" data-testid="text-dialog-title">
            <span>Help me understand better (Round {roundNumber}/{maxRounds})</span>
            <Badge 
              variant={confidencePercentage >= 80 ? 'default' : 'secondary'}
              data-testid="badge-confidence"
            >
              {confidencePercentage >= 80 ? '✓ ' : ''}Confidence: {confidencePercentage}%
            </Badge>
          </DialogTitle>
          <DialogDescription>
            I need a bit more information to give you the best possible result
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Understanding Progress</span>
              <span className="font-medium">{confidencePercentage}%</span>
            </div>
            <Progress value={confidencePercentage} data-testid="progress-confidence" />
          </div>

          <div className="space-y-4" data-testid="container-questions">
            {questions.map((q, idx) => (
              <Card key={idx} data-testid={`card-question-${idx}`}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1" data-testid={`text-question-${idx}`}>
                          {q.question}
                        </h4>
                        {q.reasoning && (
                          <p className="text-sm text-muted-foreground" data-testid={`text-reasoning-${idx}`}>
                            {q.reasoning}
                          </p>
                        )}
                        {q.category && (
                          <Badge variant="outline" className="mt-2">
                            {q.category}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Textarea
                        value={answers[idx] || ''}
                        onChange={(e) => handleAnswerChange(idx, e.target.value)}
                        placeholder="Your answer..."
                        rows={3}
                        className="resize-none"
                        data-testid={`input-answer-${idx}`}
                      />
                      <div className="flex justify-end">
                        <Button
                          variant={isRecording === idx ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleVoiceInput(idx)}
                          data-testid={`button-voice-${idx}`}
                        >
                          <Mic className="h-4 w-4 mr-2" />
                          {isRecording === idx ? 'Stop Recording' : 'Voice Answer'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2">
          {onClose && (
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              data-testid="button-skip"
            >
              Skip for now
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isLoading || answers.every(a => a.trim() === '')}
            data-testid="button-submit"
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Send className="h-4 w-4 mr-2" />
            {shouldAutoContinue ? 'Continue' : 'Next Round'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
