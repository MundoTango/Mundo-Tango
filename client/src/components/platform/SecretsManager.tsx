// FEATURE 1.2: SECRETS MANAGEMENT - Frontend Component
// Manage environment variables with encryption and platform sync
// Created: October 31, 2025

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Key, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
} from "lucide-react";

interface EnvironmentVariable {
  id: number;
  key: string;
  valueMasked: string; // Masked value like "********abc123"
  environment: string;
  syncedToVercel: boolean;
  syncedToRailway: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface CreatedSecret extends EnvironmentVariable {
  value?: string; // Plaintext value (only on creation)
  warningMessage?: string;
}

export function SecretsManager() {
  const [environment, setEnvironment] = useState<string>("development");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createdSecret, setCreatedSecret] = useState<CreatedSecret | null>(null);
  const { toast } = useToast();

  // Fetch secrets
  const { data: secrets, isLoading } = useQuery<{ secrets: EnvironmentVariable[] }>({
    queryKey: ["/api/secrets", environment],
  });

  // Create secret mutation
  const createSecretMutation = useMutation({
    mutationFn: async (data: { key: string; value: string; environment: string }) => {
      const res = await apiRequest("POST", "/api/secrets", data);
      return await res.json();
    },
    onSuccess: (data: { secret: CreatedSecret }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/secrets"] });
      setShowCreateDialog(false);
      setCreatedSecret(data.secret);
      toast({
        title: "Secret Created",
        description: data.secret.warningMessage || "Copy the value now - you won't see it again!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Secret",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete secret mutation
  const deleteSecretMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/secrets/${id}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/secrets"] });
      toast({
        title: "Secret Deleted",
        description: "Environment variable removed from all platforms",
      });
    },
  });

  // Sync secrets mutation
  const syncSecretsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/secrets/sync", { environment });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/secrets"] });
      toast({
        title: "Secrets Synced",
        description: "All secrets synced to Vercel and Railway",
      });
    },
  });

  // Handle create submit
  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createSecretMutation.mutate({
      key: formData.get("key") as string,
      value: formData.get("value") as string,
      environment,
    });
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Value copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Key className="w-6 h-6" />
            Environment Variables
          </h2>
          <p className="text-sm text-muted-foreground">
            Securely manage secrets synced to Vercel and Railway
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={environment} onValueChange={setEnvironment}>
            <SelectTrigger className="w-[180px]" data-testid="select-environment">
              <SelectValue placeholder="Environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="preview">Preview</SelectItem>
              <SelectItem value="production">Production</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => syncSecretsMutation.mutate()}
            disabled={syncSecretsMutation.isPending}
            data-testid="button-sync-secrets"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync All
          </Button>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-create-secret">
                <Plus className="w-4 h-4 mr-2" />
                Add Secret
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-create-secret">
              <DialogHeader>
                <DialogTitle>Create Environment Variable</DialogTitle>
                <DialogDescription>
                  Add a new secret that will be synced to Vercel and Railway
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="key">Key</Label>
                  <Input
                    id="key"
                    name="key"
                    placeholder="API_KEY"
                    required
                    data-testid="input-secret-key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    name="value"
                    type="password"
                    placeholder="secret-value-here"
                    required
                    data-testid="input-secret-value"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createSecretMutation.isPending}
                  data-testid="button-submit-secret"
                >
                  {createSecretMutation.isPending ? "Creating..." : "Create Secret"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Secrets Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Vercel</TableHead>
              <TableHead>Railway</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Loading secrets...
                </TableCell>
              </TableRow>
            ) : secrets?.secrets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No secrets found. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              secrets?.secrets.map((secret) => (
                <TableRow key={secret.id} data-testid={`row-secret-${secret.id}`}>
                  <TableCell className="font-mono font-medium" data-testid={`text-key-${secret.id}`}>
                    {secret.key}
                  </TableCell>
                  <TableCell>
                    <code className="text-sm font-mono" data-testid={`text-value-${secret.id}`}>
                      {secret.valueMasked}
                    </code>
                    <p className="text-xs text-muted-foreground mt-1">
                      Encrypted - cannot view after creation
                    </p>
                  </TableCell>
                  <TableCell>
                    {secret.syncedToVercel ? (
                      <Badge className="bg-green-500" data-testid={`badge-vercel-synced-${secret.id}`}>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Synced
                      </Badge>
                    ) : (
                      <Badge variant="outline" data-testid={`badge-vercel-pending-${secret.id}`}>
                        <XCircle className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {secret.syncedToRailway ? (
                      <Badge className="bg-green-500" data-testid={`badge-railway-synced-${secret.id}`}>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Synced
                      </Badge>
                    ) : (
                      <Badge variant="outline" data-testid={`badge-railway-pending-${secret.id}`}>
                        <XCircle className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSecretMutation.mutate(secret.id)}
                      disabled={deleteSecretMutation.isPending}
                      data-testid={`button-delete-${secret.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Info Card */}
      <div className="rounded-lg border p-4 bg-muted/30">
        <h3 className="font-medium mb-2">🔒 Security</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• All values are encrypted with AES-256 before storage</li>
          <li>• Secrets are shown ONLY ONCE during creation</li>
          <li>• After creation, values are permanently encrypted</li>
          <li>• Secrets are automatically synced to Vercel and Railway</li>
        </ul>
      </div>

      {/* Created Secret Dialog - Show Once */}
      {createdSecret && createdSecret.value && (
        <Dialog open={true} onOpenChange={() => setCreatedSecret(null)}>
          <DialogContent className="sm:max-w-[500px]" data-testid="dialog-created-secret">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-yellow-600">
                <Key className="w-5 h-5" />
                Secret Created - Copy Now!
              </DialogTitle>
              <DialogDescription className="font-medium text-destructive">
                {createdSecret.warningMessage}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Key</Label>
                <Input value={createdSecret.key} readOnly data-testid="input-created-key" />
              </div>

              <div className="space-y-2">
                <Label>Value (Plaintext - Copy Now!)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={createdSecret.value}
                    readOnly
                    className="font-mono"
                    data-testid="input-created-value"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(createdSecret.value!)}
                    data-testid="button-copy-value"
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This is the last time you'll see this value. Copy it now!
                </p>
              </div>

              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ After closing this dialog, the value will be permanently encrypted. You'll only see "*******" in the table.
                </p>
              </div>

              <Button
                onClick={() => setCreatedSecret(null)}
                className="w-full"
                data-testid="button-close-created"
              >
                I've Copied It - Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
