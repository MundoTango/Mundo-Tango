import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Database, Download, Trash2, Check, Clock, AlertCircle, Plus } from "lucide-react";

interface DatabaseBackup {
  id: number;
  backupName: string;
  status: string;
  size: number;
  createdAt: string;
}

export function BackupsManager() {
  const { toast } = useToast();

  const { data: backups = [], isLoading } = useQuery<DatabaseBackup[]>({
    queryKey: ["/api/platform/backups"],
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/platform/backups", {
        backupName: `backup_${Date.now()}`,
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platform/backups"] });
      toast({ title: "Backup created", description: "Database backup has been initiated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/platform/backups/${id}`).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platform/backups"] });
      toast({ title: "Backup deleted", description: "Database backup has been removed" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; icon: any; label: string }> = {
      completed: { variant: "default", icon: Check, label: "Completed" },
      in_progress: { variant: "secondary", icon: Clock, label: "In Progress" },
      failed: { variant: "destructive", icon: AlertCircle, label: "Failed" },
    };
    const config = variants[status] || variants.in_progress;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
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
          <h2 className="text-2xl font-semibold">Database Backups</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage database backups and restores
          </p>
        </div>
        <Button
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          className="gap-2"
          data-testid="button-create-backup"
        >
          <Plus className="w-4 h-4" />
          {createMutation.isPending ? "Creating..." : "Create Backup"}
        </Button>
      </div>

      {backups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Database className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No backups yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first database backup
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {backups.map((backup) => (
            <Card key={backup.id} data-testid={`card-backup-${backup.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg" data-testid={`text-backup-name-${backup.id}`}>
                        {backup.backupName}
                      </CardTitle>
                      <CardDescription className="text-sm mt-1">
                        Created {new Date(backup.createdAt).toLocaleString()}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(backup.status)}
                    {backup.status === "completed" && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          data-testid={`button-download-backup-${backup.id}`}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              data-testid={`button-delete-backup-${backup.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete backup?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete {backup.backupName}. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(backup.id)}
                                data-testid={`button-confirm-delete-backup-${backup.id}`}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Size: {formatSize(backup.size)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
