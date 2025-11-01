import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Eye, EyeOff, Trash2, RefreshCw, Check, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageLayout } from "@/components/PageLayout";

interface Secret {
  id: number;
  key: string;
  valueMasked: string;
  environment: string;
  syncedToVercel: boolean;
  syncedToRailway: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SecretsPage() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSecret, setNewSecret] = useState({
    key: "",
    value: "",
    environment: "production"
  });
  const [showNewSecretValue, setShowNewSecretValue] = useState(false);
  const [createdSecretValue, setCreatedSecretValue] = useState("");

  // Fetch secrets
  const { data: secrets = [], isLoading } = useQuery<Secret[]>({
    queryKey: ["/api/secrets"],
  });

  // Create secret mutation
  const createSecretMutation = useMutation({
    mutationFn: async (data: typeof newSecret) => {
      const response = await apiRequest("POST", "/api/secrets", data);
      return await response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/secrets"] });
      setCreatedSecretValue(data.secret.value);
      setNewSecret({ key: "", value: "", environment: "production" });
      toast({
        title: "Secret created",
        description: "Copy the value now - you won't be able to see it again!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating secret",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete secret mutation
  const deleteSecretMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/secrets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/secrets"] });
      toast({
        title: "Secret deleted",
        description: "Environment variable removed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting secret",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Sync secrets mutation
  const syncSecretsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/secrets/sync");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/secrets"] });
      toast({
        title: "Secrets synced",
        description: "All secrets synced to Vercel and Railway",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error syncing secrets",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateSecret = () => {
    if (!newSecret.key || !newSecret.value) {
      toast({
        title: "Validation error",
        description: "Key and value are required",
        variant: "destructive",
      });
      return;
    }
    createSecretMutation.mutate(newSecret);
  };

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
    setCreatedSecretValue("");
    setShowNewSecretValue(false);
  };

  return (
    <PageLayout title="Secrets Management" showBreadcrumbs>
<div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          
          <p className="text-muted-foreground mt-1">
            Manage environment variables for your deployments
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => syncSecretsMutation.mutate()}
            disabled={syncSecretsMutation.isPending}
            variant="outline"
            data-testid="button-sync-secrets"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncSecretsMutation.isPending ? "animate-spin" : ""}`} />
            Sync to Platforms
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-secret">
                <Plus className="w-4 h-4 mr-2" />
                Add Secret
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-add-secret">
              <DialogHeader>
                <DialogTitle>Add New Secret</DialogTitle>
                <DialogDescription>
                  Create a new environment variable. It will be encrypted and synced to your platforms.
                </DialogDescription>
              </DialogHeader>

              {createdSecretValue ? (
                <Alert>
                  <AlertDescription className="space-y-3">
                    <p className="font-semibold">⚠️ Copy this value now!</p>
                    <p>You won't be able to see it again after closing this dialog.</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type={showNewSecretValue ? "text" : "password"}
                        value={createdSecretValue}
                        readOnly
                        className="font-mono"
                        data-testid="input-created-secret-value"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setShowNewSecretValue(!showNewSecretValue)}
                        data-testid="button-toggle-secret-visibility"
                      >
                        {showNewSecretValue ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(createdSecretValue);
                          toast({ title: "Copied to clipboard" });
                        }}
                        data-testid="button-copy-secret"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="key">Key</Label>
                    <Input
                      id="key"
                      placeholder="e.g., API_KEY, DATABASE_URL"
                      value={newSecret.key}
                      onChange={(e) => setNewSecret({ ...newSecret, key: e.target.value })}
                      data-testid="input-secret-key"
                    />
                  </div>

                  <div>
                    <Label htmlFor="value">Value</Label>
                    <Input
                      id="value"
                      type="password"
                      placeholder="Secret value"
                      value={newSecret.value}
                      onChange={(e) => setNewSecret({ ...newSecret, value: e.target.value })}
                      data-testid="input-secret-value"
                    />
                  </div>

                  <div>
                    <Label htmlFor="environment">Environment</Label>
                    <Select
                      value={newSecret.environment}
                      onValueChange={(value) => setNewSecret({ ...newSecret, environment: value })}
                    >
                      <SelectTrigger id="environment" data-testid="select-environment">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="preview">Preview</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <DialogFooter>
                {createdSecretValue ? (
                  <Button onClick={handleCloseAddDialog} data-testid="button-close-dialog">
                    Close
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateSecret}
                      disabled={createSecretMutation.isPending}
                      data-testid="button-create-secret"
                    >
                      {createSecretMutation.isPending ? "Creating..." : "Create Secret"}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>
            Secrets are encrypted and never displayed after creation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8" data-testid="loading-secrets">Loading secrets...</div>
          ) : secrets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="no-secrets">
              No secrets configured. Add your first environment variable to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Sync Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {secrets.map((secret) => (
                  <TableRow key={secret.id} data-testid={`row-secret-${secret.id}`}>
                    <TableCell className="font-mono font-semibold">{secret.key}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{secret.valueMasked}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{secret.environment}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Badge variant={secret.syncedToVercel ? "default" : "secondary"} className="text-xs">
                          {secret.syncedToVercel ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                          Vercel
                        </Badge>
                        <Badge variant={secret.syncedToRailway ? "default" : "secondary"} className="text-xs">
                          {secret.syncedToRailway ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                          Railway
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(secret.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSecretMutation.mutate(secret.id)}
                        disabled={deleteSecretMutation.isPending}
                        data-testid={`button-delete-secret-${secret.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
    </PageLayout>);
}
