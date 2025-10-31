import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle2, Clock, ExternalLink, Trash2, XCircle } from "lucide-react";

interface PreviewDeployment {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  status: string;
  gitCommitSha: string | null;
  gitBranch: string;
  previewUrl: string | null;
  deploymentId: number | null;
  expiresAt: string;
  expiredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function PreviewManager() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gitBranch, setGitBranch] = useState("main");

  const { data: previewsData, isLoading } = useQuery<{ previews: PreviewDeployment[] }>({
    queryKey: ["/api/previews"],
  });

  const createPreviewMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string; gitBranch: string }) => {
      return await apiRequest("/api/previews", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/previews"] });
      toast({
        title: "Preview deployment created",
        description: "Your preview environment will be ready in a few moments.",
      });
      setName("");
      setDescription("");
      setGitBranch("main");
    },
    onError: () => {
      toast({
        title: "Failed to create preview",
        description: "Could not create preview deployment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deletePreviewMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/previews/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/previews"] });
      toast({
        title: "Preview deleted",
        description: "Preview environment has been removed.",
      });
    },
  });

  const expirePreviewMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/previews/${id}/expire`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/previews"] });
      toast({
        title: "Preview expired",
        description: "Preview environment has been marked as expired.",
      });
    },
  });

  const handleCreate = () => {
    if (!name || !gitBranch) {
      toast({
        title: "Missing fields",
        description: "Please provide a name and git branch.",
        variant: "destructive",
      });
      return;
    }

    createPreviewMutation.mutate({
      name,
      description: description || undefined,
      gitBranch,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "building":
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "expired":
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "active":
        return "default";
      case "building":
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      case "expired":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Preview Deployment</CardTitle>
          <CardDescription>
            Deploy a preview environment for testing. Previews automatically expire after 7 days.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="preview-name">Preview Name</Label>
            <Input
              id="preview-name"
              data-testid="input-preview-name"
              placeholder="feature-auth-update"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preview-description">Description (Optional)</Label>
            <Textarea
              id="preview-description"
              data-testid="input-preview-description"
              placeholder="Testing new authentication flow"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preview-branch">Git Branch</Label>
            <Input
              id="preview-branch"
              data-testid="input-preview-branch"
              placeholder="main"
              value={gitBranch}
              onChange={(e) => setGitBranch(e.target.value)}
            />
          </div>
          <Button
            data-testid="button-create-preview"
            onClick={handleCreate}
            disabled={createPreviewMutation.isPending}
          >
            {createPreviewMutation.isPending ? "Creating..." : "Create Preview"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Previews</CardTitle>
          <CardDescription>
            Your preview deployments will appear here. They automatically expire after 7 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading previews...</p>
          ) : previewsData?.previews && previewsData.previews.length > 0 ? (
            <div className="space-y-3">
              {previewsData.previews.map((preview) => (
                <Card key={preview.id} data-testid={`card-preview-${preview.id}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold" data-testid={`text-preview-name-${preview.id}`}>
                            {preview.name}
                          </h4>
                          <Badge variant={getStatusVariant(preview.status)} className="gap-1">
                            {getStatusIcon(preview.status)}
                            {preview.status}
                          </Badge>
                        </div>
                        {preview.description && (
                          <p className="text-sm text-muted-foreground">{preview.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Branch: {preview.gitBranch}</span>
                          <span>
                            Expires: {new Date(preview.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                        {preview.previewUrl && (
                          <a
                            href={preview.previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                            data-testid={`link-preview-url-${preview.id}`}
                          >
                            View Preview
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {preview.status === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            data-testid={`button-expire-preview-${preview.id}`}
                            onClick={() => expirePreviewMutation.mutate(preview.id)}
                            disabled={expirePreviewMutation.isPending}
                          >
                            Expire
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          data-testid={`button-delete-preview-${preview.id}`}
                          onClick={() => deletePreviewMutation.mutate(preview.id)}
                          disabled={deletePreviewMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No preview deployments yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}