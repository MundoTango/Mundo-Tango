import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, RefreshCw, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { AccountConnectionModal } from "@/components/financial/AccountConnectionModal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { SelectFinancialAccount } from "@shared/schema";

const PROVIDER_LOGOS: Record<string, string> = {
  coinbase: '₿',
  schwab: 'CS',
  puzzle: 'PZ',
  mercury: 'M',
  plaid: 'P',
  other: '?',
};

export default function FinancialAccountsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts, isLoading } = useQuery<SelectFinancialAccount[]>({
    queryKey: ['/api/financial/accounts'],
  });

  const syncAccount = useMutation({
    mutationFn: async (accountId: number) => {
      const response = await apiRequest(`/api/financial/accounts/${accountId}/sync`, {
        method: 'POST',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/financial/accounts'] });
      toast({
        title: "Sync Started",
        description: "Account synchronization in progress",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (lastSynced: string | null) => {
    if (!lastSynced) {
      return (
        <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
          <Clock className="h-3 w-3 mr-1" />
          Never Synced
        </Badge>
      );
    }

    const lastSyncTime = new Date(lastSynced).getTime();
    const now = Date.now();
    const hoursSinceSync = (now - lastSyncTime) / (1000 * 60 * 60);

    if (hoursSinceSync < 1) {
      return (
        <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
          <CheckCircle className="h-3 w-3 mr-1" />
          Connected
        </Badge>
      );
    } else if (hoursSinceSync < 24) {
      return (
        <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
          <Clock className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30">
          <AlertCircle className="h-3 w-3 mr-1" />
          Needs Sync
        </Badge>
      );
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="p-3 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.2) 0%, rgba(30, 144, 255, 0.2) 100%)',
              border: '1px solid rgba(64, 224, 208, 0.3)',
            }}
          >
            <Building2 className="h-6 w-6" style={{ color: '#40E0D0' }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Connected Accounts</h1>
            <p className="text-muted-foreground">Manage your external account connections</p>
          </div>
        </div>
        <AccountConnectionModal />
      </div>

      {/* Info Banner */}
      <div 
        className="p-4 rounded-lg"
        style={{
          background: 'rgba(64, 224, 208, 0.05)',
          border: '1px solid rgba(64, 224, 208, 0.2)',
        }}
      >
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#40E0D0' }} />
          <div>
            <p className="text-sm font-medium">Secure Connections</p>
            <p className="text-xs text-muted-foreground mt-1">
              All account credentials are encrypted and stored securely. We use bank-level security to protect your data.
            </p>
          </div>
        </div>
      </div>

      {/* Accounts Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : accounts && accounts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Card
              key={account.id}
              className="hover-elevate transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.05) 0%, rgba(30, 144, 255, 0.05) 100%)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(64, 224, 208, 0.1)',
              }}
              data-testid={`card-account-${account.id}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold"
                    style={{
                      background: 'rgba(64, 224, 208, 0.2)',
                      border: '1px solid rgba(64, 224, 208, 0.3)',
                      color: '#40E0D0',
                    }}
                  >
                    {PROVIDER_LOGOS[account.provider] || '?'}
                  </div>
                  <div>
                    <CardTitle className="text-base capitalize">{account.provider}</CardTitle>
                    <p className="text-xs text-muted-foreground capitalize">{account.accountType}</p>
                  </div>
                </div>
                {getStatusBadge(account.lastSyncedAt)}
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Account ID</p>
                  <p className="text-sm font-mono">{account.accountId}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className="text-2xl font-bold" style={{ color: '#40E0D0' }}>
                    ${parseFloat(account.balance || "0").toLocaleString('en-US', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </p>
                </div>

                {account.lastSyncedAt && (
                  <div>
                    <p className="text-xs text-muted-foreground">Last Synced</p>
                    <p className="text-xs">
                      {new Date(account.lastSyncedAt).toLocaleString()}
                    </p>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => syncAccount.mutate(account.id)}
                  disabled={syncAccount.isPending}
                  data-testid={`button-sync-account-${account.id}`}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${syncAccount.isPending ? 'animate-spin' : ''}`} />
                  {syncAccount.isPending ? 'Syncing...' : 'Sync Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div 
          className="flex flex-col items-center justify-center h-96 rounded-lg"
          style={{
            background: 'rgba(64, 224, 208, 0.05)',
            border: '1px solid rgba(64, 224, 208, 0.1)',
          }}
        >
          <Building2 className="h-16 w-16 mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No Connected Accounts</p>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            Connect your brokerage, crypto, or banking accounts to automatically sync your portfolios
          </p>
          <AccountConnectionModal 
            trigger={
              <Button size="lg" data-testid="button-connect-first-account">
                <Building2 className="h-4 w-4 mr-2" />
                Connect Your First Account
              </Button>
            }
          />
        </div>
      )}

      {/* Supported Providers */}
      <div 
        className="p-6 rounded-lg"
        style={{
          background: 'rgba(64, 224, 208, 0.03)',
          border: '1px solid rgba(64, 224, 208, 0.1)',
        }}
      >
        <h3 className="text-lg font-semibold mb-4">Supported Providers</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(PROVIDER_LOGOS).map(([provider, logo]) => (
            <div 
              key={provider}
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{
                background: 'rgba(64, 224, 208, 0.05)',
                border: '1px solid rgba(64, 224, 208, 0.1)',
              }}
            >
              <div 
                className="w-10 h-10 rounded flex items-center justify-center text-lg font-bold"
                style={{
                  background: 'rgba(64, 224, 208, 0.15)',
                  color: '#40E0D0',
                }}
              >
                {logo}
              </div>
              <span className="text-sm font-medium capitalize">{provider}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
