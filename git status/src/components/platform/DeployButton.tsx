// FEATURE 1: DEPLOYMENT AUTOMATION - Frontend Component
// One-click deployment to Vercel + Railway
// Created: October 31, 2025

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Rocket, CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";

interface Deployment {
  id: number;
  type: string;
  status: string;
  gitBranch: string;
  gitCommitSha?: string;
  gitCommitMessage?: string;
  vercelUrl?: string;
  railwayUrl?: string;
  buildLogs?: string;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
  durationSeconds?: number;
}

interface DeployButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function DeployButton({ variant = "default", size = "default" }: DeployButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [currentDeployment, setCurrentDeployment] = useState<Deployment | null>(null);
  const { toast } = useToast();

  // Create deployment mutation
  const createDeploymentMutation = useMutation({
    mutationFn: async (data: { type: string; gitBranch: string }) => {
      const res = await apiRequest("POST", "/api/deployments", data);
      const json = await res.json();
      return json;
    },
    onSuccess: (data: { deployment: Deployment }) => {
      setCurrentDeployment(data.deployment);
      setShowDialog(true);
      queryClient.invalidateQueries({ queryKey: ["/api/deployments"] });
      
      toast({
        title: "Deployment Started",
        description: "Your app is being deployed to Vercel + Railway",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Deployment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle deploy click
  const handleDeploy = () => {
    createDeploymentMutation.mutate({
      type: "production",
      gitBranch: "main",
    });
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      case "building":
      case "deploying":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-500" data-testid="icon-success" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" data-testid="icon-failed" />;
      case "building":
      case "deploying":
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" data-testid="icon-loading" />;
      default:
        return null;
    }
  };

  // Calculate progress percentage
  const getProgress = (status: string) => {
    switch (status) {
      case "pending":
        return 10;
      case "building":
        return 40;
      case "deploying":
        return 70;
      case "success":
        return 100;
      case "failed":
        return 0;
      default:
        return 0;
    }
  };

  return (
    <>
      <Button
        onClick={handleDeploy}
        disabled={createDeploymentMutation.isPending}
        variant={variant}
        size={size}
        data-testid="button-deploy"
      >
        {createDeploymentMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" data-testid="icon-deploying" />
            Deploying...
          </>
        ) : (
          <>
            <Rocket className="w-4 h-4 mr-2" data-testid="icon-rocket" />
            Deploy to Production
          </>
        )}
      </Button>

      {/* Deployment Progress Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px]" data-testid="dialog-deployment-progress">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              Deployment Progress
            </DialogTitle>
            <DialogDescription>
              Deploying your application to Vercel (frontend) and Railway (backend)
            </DialogDescription>
          </DialogHeader>

          {currentDeployment && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(currentDeployment.status)}
                  <span className="font-medium" data-testid="text-deployment-status">
                    {currentDeployment.status.charAt(0).toUpperCase() + currentDeployment.status.slice(1)}
                  </span>
                </div>
                <Badge className={getStatusColor(currentDeployment.status)} data-testid="badge-status">
                  {currentDeployment.type}
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <Progress 
                  value={getProgress(currentDeployment.status)} 
                  className="h-2"
                  data-testid="progress-deployment"
                />
                <p className="text-sm text-muted-foreground" data-testid="text-progress">
                  {getProgress(currentDeployment.status)}% complete
                </p>
              </div>

              {/* Git Info */}
              {currentDeployment.gitCommitMessage && (
                <div className="rounded-lg border p-3 space-y-1">
                  <p className="text-sm font-medium">Latest Commit</p>
                  <p className="text-sm text-muted-foreground" data-testid="text-commit-message">
                    {currentDeployment.gitCommitMessage}
                  </p>
                  {currentDeployment.gitCommitSha && (
                    <p className="text-xs text-muted-foreground font-mono" data-testid="text-commit-sha">
                      {currentDeployment.gitCommitSha.slice(0, 7)}
                    </p>
                  )}
                </div>
              )}

              {/* Deployment URLs */}
              {(currentDeployment.vercelUrl || currentDeployment.railwayUrl) && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Deployment URLs</p>
                  {currentDeployment.vercelUrl && (
                    <a
                      href={currentDeployment.vercelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
                      data-testid="link-vercel-url"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Frontend (Vercel)
                    </a>
                  )}
                  {currentDeployment.railwayUrl && (
                    <a
                      href={currentDeployment.railwayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
                      data-testid="link-railway-url"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Backend (Railway)
                    </a>
                  )}
                </div>
              )}

              {/* Error Message */}
              {currentDeployment.errorMessage && (
                <div className="rounded-lg bg-destructive/10 border border-destructive p-3">
                  <p className="text-sm font-medium text-destructive">Error</p>
                  <p className="text-sm text-destructive/80" data-testid="text-error-message">
                    {currentDeployment.errorMessage}
                  </p>
                </div>
              )}

              {/* Duration */}
              {currentDeployment.durationSeconds && (
                <p className="text-sm text-muted-foreground" data-testid="text-duration">
                  Completed in {currentDeployment.durationSeconds}s
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                {currentDeployment.status === "success" && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowDialog(false)}
                    data-testid="button-close"
                  >
                    Close
                  </Button>
                )}
                {(currentDeployment.status === "building" || currentDeployment.status === "deploying") && (
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    data-testid="button-cancel"
                  >
                    Cancel Deployment
                  </Button>
                )}
                {currentDeployment.status === "failed" && (
                  <Button 
                    variant="default" 
                    className="w-full"
                    onClick={handleDeploy}
                    data-testid="button-retry"
                  >
                    Retry Deployment
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
