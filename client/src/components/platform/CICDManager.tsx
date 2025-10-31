import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, GitBranch, Trash2, Play, Check, X, Clock, AlertCircle } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const pipelineSchema = z.object({
  pipelineName: z.string().min(3, "Pipeline name must be at least 3 characters"),
  repositoryUrl: z.string().url("Invalid repository URL"),
  branch: z.string().min(1, "Branch is required"),
});

type PipelineFormData = z.infer<typeof pipelineSchema>;

interface CICDPipeline {
  id: number;
  pipelineName: string;
  repositoryUrl: string;
  branch: string;
  status: string;
  lastRunAt: string | null;
  createdAt: string;
}

interface CICDRun {
  id: number;
  pipelineId: number;
  status: string;
  triggerType: string;
  startedAt: string;
  completedAt: string | null;
}

export function CICDManager() {
  const [isPipelineDialogOpen, setIsPipelineDialogOpen] = useState(false);
  const [selectedPipelineId, setSelectedPipelineId] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<PipelineFormData>({
    resolver: zodResolver(pipelineSchema),
    defaultValues: {
      pipelineName: "",
      repositoryUrl: "",
      branch: "main",
    },
  });

  const { data: pipelines = [], isLoading } = useQuery<CICDPipeline[]>({
    queryKey: ["/api/platform/cicd/pipelines"],
  });

  const { data: runsResponse } = useQuery<{runs: CICDRun[]}>({
    queryKey: [`/api/platform/cicd/runs/${selectedPipelineId}`],
    enabled: !!selectedPipelineId,
  });
  const runs = runsResponse?.runs || [];

  const createMutation = useMutation({
    mutationFn: (data: PipelineFormData) =>
      apiRequest("POST", "/api/platform/cicd/pipelines", data).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platform/cicd/pipelines"] });
      toast({ title: "Pipeline created", description: "CI/CD pipeline has been created" });
      setIsPipelineDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/platform/cicd/pipelines/${id}`).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platform/cicd/pipelines"] });
      toast({ title: "Pipeline deleted", description: "CI/CD pipeline has been removed" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const triggerMutation = useMutation({
    mutationFn: (pipelineId: number) =>
      apiRequest("POST", "/api/platform/cicd/runs", { pipelineId, triggerType: "manual" }).then(r => r.json()),
    onSuccess: (_, pipelineId) => {
      queryClient.invalidateQueries({ queryKey: [`/api/platform/cicd/runs/${pipelineId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/platform/cicd/pipelines"] });
      toast({ title: "Run triggered", description: "CI/CD run has been started" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (data: PipelineFormData) => {
    createMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; icon: any; label: string }> = {
      success: { variant: "default", icon: Check, label: "Success" },
      running: { variant: "secondary", icon: Clock, label: "Running" },
      failed: { variant: "destructive", icon: X, label: "Failed" },
      pending: { variant: "secondary", icon: Clock, label: "Pending" },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 bg-muted animate-pulse rounded-lg" />
        <div className="h-24 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">CI/CD Pipelines</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage continuous integration and deployment pipelines
          </p>
        </div>
        <Dialog open={isPipelineDialogOpen} onOpenChange={setIsPipelineDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-create-pipeline">
              <Plus className="w-4 h-4" />
              Create Pipeline
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create CI/CD Pipeline</DialogTitle>
              <DialogDescription>
                Configure a new continuous integration pipeline
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="pipelineName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pipeline Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="My CI/CD Pipeline"
                          data-testid="input-pipeline-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="repositoryUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repository URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://github.com/user/repo"
                          data-testid="input-repository-url"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="main"
                          data-testid="input-branch"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPipelineDialogOpen(false)}
                    data-testid="button-cancel-pipeline"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    data-testid="button-submit-pipeline"
                  >
                    {createMutation.isPending ? "Creating..." : "Create Pipeline"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {pipelines.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GitBranch className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No CI/CD pipelines yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first pipeline to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pipelines.map((pipeline) => (
            <Card key={pipeline.id} data-testid={`card-pipeline-${pipeline.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <GitBranch className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg" data-testid={`text-pipeline-name-${pipeline.id}`}>
                        {pipeline.pipelineName}
                      </CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {pipeline.repositoryUrl} ({pipeline.branch})
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(pipeline.status)}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => triggerMutation.mutate(pipeline.id)}
                      disabled={triggerMutation.isPending}
                      data-testid={`button-trigger-pipeline-${pipeline.id}`}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPipelineId(pipeline.id)}
                      data-testid={`button-view-runs-${pipeline.id}`}
                    >
                      View Runs
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          data-testid={`button-delete-pipeline-${pipeline.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete pipeline?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will delete {pipeline.pipelineName} and all its run history. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(pipeline.id)}
                            data-testid={`button-confirm-delete-pipeline-${pipeline.id}`}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Last run: {pipeline.lastRunAt ? new Date(pipeline.lastRunAt).toLocaleString() : "Never"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedPipelineId && runs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Run History</CardTitle>
            <CardDescription>Recent runs for selected pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {runs.slice(0, 10).map((run) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                  data-testid={`card-run-${run.id}`}
                >
                  <div>
                    <p className="text-sm font-medium">Run #{run.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {run.triggerType} • Started {new Date(run.startedAt).toLocaleString()}
                    </p>
                  </div>
                  {getStatusBadge(run.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
