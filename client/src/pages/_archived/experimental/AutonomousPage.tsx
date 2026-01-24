import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { AutonomousWorkflowPanel } from "@/components/autonomous/AutonomousWorkflowPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function AutonomousPage() {
  const { t } = useTranslation(["pages", "common"]);
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Check if user has God Level access (role === 'god')
  const isGodLevel = user?.role === 'god';

  useEffect(() => {
    // Redirect to feed if not authorized
    if (user && !isGodLevel) {
      navigate("/feed");
    }
  }, [user, isGodLevel, navigate]);

  // Show loading state while checking auth
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Brain className="h-16 w-16 mx-auto mb-4 animate-pulse text-primary" />
          <p className="text-muted-foreground">{t('common:loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  // Show access denied message for non-God Level users
  if (!isGodLevel) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <Alert 
          className="border-destructive/50 bg-destructive/10"
          data-testid="alert-access-denied"
        >
          <AlertCircle className="h-5 w-5 text-destructive" />
          <AlertTitle className="text-destructive font-semibold">
            {t('pages:agents.godLevelAccessRequired', 'God Level Access Required')}
          </AlertTitle>
          <AlertDescription className="text-destructive-foreground mt-2">
            {t('pages:agents.restrictedAccessDescription', 'This page is restricted to God Level (Tier 8) users only. The Autonomous Workflow feature uses advanced AI capabilities and the MB.MD methodology to autonomously build features and make code changes.')}
          </AlertDescription>
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/feed")}
              data-testid="button-return-feed"
            >
              {t('pages:agents.returnToFeed', 'Return to Feed')}
            </Button>
          </div>
        </Alert>

        <Card className="mt-8 hover-elevate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {t('pages:agents.whatIsGodLevel', 'What is God Level?')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {t('pages:agents.godLevelCapabilities', 'God Level access grants you the highest tier of platform capabilities, including:')}
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>{t('pages:agents.autonomousAiDev', 'Autonomous AI development with Mr. Blue')}</li>
              <li>{t('pages:agents.fullEsaFrameworkAccess', 'Full ESA Framework access for agent management')}</li>
              <li>{t('pages:agents.platformAdminTools', 'Platform administration and monitoring tools')}</li>
              <li>{t('pages:agents.advancedDeploymentFeatures', 'Advanced deployment and CI/CD features')}</li>
              <li>{t('pages:agents.priorityAiProcessing', 'Priority AI processing and unlimited quotas')}</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              {t('pages:agents.contactAdminGodLevel', 'Contact platform administrators to learn more about God Level access.')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render the autonomous workflow panel for authorized users
  return (
    <div 
      className="min-h-screen p-6"
      style={{
        background: 'linear-gradient(180deg, rgba(10, 24, 40, 0.98) 0%, rgba(30, 144, 255, 0.08) 100%)',
      }}
    >
      <div className="container mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Brain className="h-8 w-8 text-primary" />
                <h1 
                  className="text-4xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 50%, #0047AB 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {t('pages:agents.autonomousDevelopment', 'Autonomous Development')}
                </h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-3xl">
                {t('pages:agents.autonomousDescription', "Leverage Mr. Blue's autonomous capabilities to build features using the MB.MD methodology. Describe your requirements and watch as the AI decomposes tasks, generates code, validates changes, and awaits your approval before applying them.")}
              </p>
            </div>
            <Badge 
              variant="outline"
              className="border-2 border-primary bg-primary/10 text-primary px-4 py-2 text-sm font-semibold"
              data-testid="badge-god-level"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {t('pages:agents.godLevelOnly', 'God Level Only')}
            </Badge>
          </div>
        </div>

        {/* Info Card - MB.MD Methodology */}
        <Card className="mb-6 hover-elevate border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              {t('pages:agents.mbmdMethodology', 'MB.MD Methodology')}
            </CardTitle>
            <CardDescription>
              {t('pages:agents.methodologySubtitle', 'Maximum Parallel Execution with Simultaneous Task Decomposition')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <h3 className="font-semibold text-sm">1. {t('pages:agents.taskDecomposition', 'Task Decomposition')}</h3>
                <p className="text-xs text-muted-foreground">
                  {t('pages:agents.decompositionDesc', 'AI breaks down your request into atomic, parallelizable subtasks with dependency tracking')}
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm">2. {t('pages:agents.codeGeneration', 'Code Generation')}</h3>
                <p className="text-xs text-muted-foreground">
                  {t('pages:agents.codeGenDesc', 'Generates production-ready code with explanations, following MT Ocean design system')}
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm">3. {t('pages:agents.validationApproval', 'Validation & Approval')}</h3>
                <p className="text-xs text-muted-foreground">
                  {t('pages:agents.validationDesc', 'LSP validation checks for errors before requiring your approval to apply changes')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Autonomous Workflow Panel */}
        <AutonomousWorkflowPanel />
      </div>
    </div>
  );
}
