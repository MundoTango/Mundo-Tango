import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Clock, CheckCircle2, AlertCircle, Star, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TestScenario {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  estimatedMinutes: number;
  steps: { step: number; action: string }[];
}

interface StepTiming {
  stepIndex: number;
  timeSpentSeconds: number;
  markedAsStuck: boolean;
}

export default function VolunteerTestingInterface() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [sessionStartTime] = useState(Date.now());
  const [stepStartTime, setStepStartTime] = useState(Date.now());
  const [stepTimings, setStepTimings] = useState<StepTiming[]>([]);
  const [stuckPoints, setStuckPoints] = useState<number[]>([]);
  const [testCompleted, setTestCompleted] = useState(false);
  const [difficultyRating, setDifficultyRating] = useState(0);
  const [clarityRating, setClarityRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);

  const scenarioId = parseInt(id || "0");

  const { data: scenario, isLoading } = useQuery<TestScenario>({
    queryKey: ["/api/volunteer/scenarios", scenarioId],
    enabled: scenarioId > 0,
  });

  const submitResultMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/volunteer/results", data);
    },
    onSuccess: () => {
      toast({
        title: "Thank you!",
        description: "Your test results have been submitted successfully",
      });
      setTimeout(() => {
        setLocation("/volunteer-recruitment");
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit results",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - stepStartTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [stepStartTime]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!testCompleted) {
        e.preventDefault();
        e.returnValue = "";
        handleAbandon();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [testCompleted]);

  const handleNextStep = () => {
    const timeSpent = Math.floor((Date.now() - stepStartTime) / 1000);
    
    setStepTimings([
      ...stepTimings,
      {
        stepIndex: currentStep,
        timeSpentSeconds: timeSpent,
        markedAsStuck: stuckPoints.includes(currentStep),
      },
    ]);

    if (scenario && currentStep < scenario.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setStepStartTime(Date.now());
      setElapsedTime(0);
    } else {
      setTestCompleted(true);
    }
  };

  const handleMarkAsStuck = () => {
    if (!stuckPoints.includes(currentStep)) {
      setStuckPoints([...stuckPoints, currentStep]);
      toast({
        title: "Marked as stuck",
        description: "We've noted this step as challenging",
      });
    }
  };

  const handleSubmit = () => {
    if (!scenario) return;

    const timeSpent = Math.floor((Date.now() - stepStartTime) / 1000);
    const finalTimings = [
      ...stepTimings,
      {
        stepIndex: currentStep,
        timeSpentSeconds: timeSpent,
        markedAsStuck: stuckPoints.includes(currentStep),
      },
    ];

    const sessionId = `session_${Date.now()}_${scenarioId}`;
    const totalTimeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);

    submitResultMutation.mutate({
      scenarioId: scenario.id,
      sessionId,
      completed: true,
      timeSpentSeconds: totalTimeSpent,
      stuckPoints: stuckPoints.map((idx) => ({
        stepIndex: idx,
        timeSpentSeconds: finalTimings.find((t) => t.stepIndex === idx)?.timeSpentSeconds || 0,
      })),
      difficultyRating,
      clarityRating,
      feedback,
      stepTimings: finalTimings,
    });
  };

  const handleAbandon = () => {
    if (!scenario) return;

    const sessionId = `session_${Date.now()}_${scenarioId}`;
    const totalTimeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);

    submitResultMutation.mutate({
      scenarioId: scenario.id,
      sessionId,
      completed: false,
      timeSpentSeconds: totalTimeSpent,
      stuckPoints: stuckPoints.map((idx) => ({ stepIndex: idx })),
      stepTimings,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-muted-foreground">Loading scenario...</div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-muted-foreground">Scenario not found</div>
      </div>
    );
  }

  const progress = ((currentStep + 1) / scenario.steps.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/volunteer-recruitment")}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Scenarios
        </Button>

        {!testCompleted ? (
          <>
            <Card className="mb-6" data-testid="card-scenario-header">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2" data-testid="text-scenario-title">
                      {scenario.title}
                    </CardTitle>
                    <CardDescription data-testid="text-scenario-description">
                      {scenario.description}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {scenario.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Step {currentStep + 1} of {scenario.steps.length}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(progress)}% complete
                      </span>
                    </div>
                    <Progress value={progress} data-testid="progress-test" />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm" data-testid="text-elapsed-time">
                        {formatTime(elapsedTime)}
                      </span>
                    </div>
                    {elapsedTime > 30 && (
                      <div className="flex items-center gap-2 text-yellow-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">Taking a while?</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6" data-testid="card-current-step">
              <CardHeader>
                <CardTitle>Current Step</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-lg" data-testid="text-current-step-action">
                    {scenario.steps[currentStep]?.action}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleMarkAsStuck}
                      variant="outline"
                      disabled={stuckPoints.includes(currentStep)}
                      data-testid="button-mark-stuck"
                    >
                      {stuckPoints.includes(currentStep) ? (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Marked as Stuck
                        </>
                      ) : (
                        <>
                          <AlertCircle className="mr-2 h-4 w-4" />
                          Mark as Stuck
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={handleNextStep}
                      className="flex-1"
                      data-testid="button-next-step"
                    >
                      {currentStep === scenario.steps.length - 1 ? "Complete Test" : "Next Step"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-all-steps">
              <CardHeader>
                <CardTitle>All Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {scenario.steps.map((step, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-md ${
                        index === currentStep
                          ? "bg-primary/10 border border-primary/20"
                          : index < currentStep
                          ? "bg-muted/50"
                          : ""
                      }`}
                      data-testid={`row-step-${index}`}
                    >
                      <div
                        className={`flex items-center justify-center w-6 h-6 rounded-full text-sm ${
                          index < currentStep
                            ? "bg-green-500 text-white"
                            : index === currentStep
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index < currentStep ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                      </div>
                      <span className={index <= currentStep ? "font-medium" : "text-muted-foreground"}>
                        {step.action}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card data-testid="card-feedback-form">
            <CardHeader>
              <CardTitle>Test Complete! Share Your Feedback</CardTitle>
              <CardDescription>
                Help us improve by rating your experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    How difficult was this scenario? *
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        variant={difficultyRating === rating ? "default" : "outline"}
                        size="icon"
                        onClick={() => setDifficultyRating(rating)}
                        data-testid={`button-difficulty-${rating}`}
                      >
                        <Star
                          className={`h-5 w-5 ${
                            difficultyRating >= rating ? "fill-current" : ""
                          }`}
                        />
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Were the instructions clear? *
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        variant={clarityRating === rating ? "default" : "outline"}
                        size="icon"
                        onClick={() => setClarityRating(rating)}
                        data-testid={`button-clarity-${rating}`}
                      >
                        <Star
                          className={`h-5 w-5 ${
                            clarityRating >= rating ? "fill-current" : ""
                          }`}
                        />
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Additional Feedback (optional)
                  </label>
                  <Textarea
                    placeholder="Share any bugs you found, confusing steps, or suggestions for improvement..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={5}
                    data-testid="textarea-feedback"
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={!difficultyRating || !clarityRating || submitResultMutation.isPending}
                  className="w-full"
                  data-testid="button-submit-feedback"
                >
                  {submitResultMutation.isPending ? "Submitting..." : "Submit Feedback"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
