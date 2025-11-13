import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, ShieldCheck, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const accountFormSchema = z.object({
  provider: z.enum(['coinbase', 'schwab', 'puzzle', 'mercury', 'plaid', 'other']),
  accountType: z.enum(['brokerage', 'crypto', 'banking', 'business']),
  accountId: z.string().min(1, "Account ID is required"),
  apiKey: z.string().min(1, "API key is required"),
  apiSecret: z.string().min(1, "API secret is required"),
});

type AccountFormData = z.infer<typeof accountFormSchema>;

interface AccountConnectionModalProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const PROVIDER_INFO: Record<string, { name: string; types: Array<'brokerage' | 'crypto' | 'banking' | 'business'> }> = {
  coinbase: { name: 'Coinbase', types: ['crypto'] },
  schwab: { name: 'Charles Schwab', types: ['brokerage'] },
  puzzle: { name: 'Puzzle', types: ['banking', 'business'] },
  mercury: { name: 'Mercury', types: ['banking', 'business'] },
  plaid: { name: 'Plaid', types: ['banking', 'brokerage'] },
  other: { name: 'Other', types: ['brokerage', 'crypto', 'banking', 'business'] },
};

export function AccountConnectionModal({ trigger, onSuccess }: AccountConnectionModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
  });

  const accountType = watch('accountType');

  const connectAccount = useMutation({
    mutationFn: async (data: AccountFormData) => {
      const response = await apiRequest('/api/financial/accounts', {
        method: 'POST',
        body: JSON.stringify({
          provider: data.provider,
          accountType: data.accountType,
          accountId: data.accountId,
          balance: "0",
          credentials: {
            apiKey: data.apiKey,
            apiSecret: data.apiSecret,
          },
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/financial/accounts'] });
      toast({
        title: "Account Connected",
        description: "Your account has been successfully connected",
      });
      reset();
      setOpen(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AccountFormData) => {
    connectAccount.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button data-testid="button-add-account">
            <Building2 className="h-4 w-4 mr-2" />
            Connect Account
          </Button>
        )}
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-[500px]"
        style={{
          background: 'linear-gradient(135deg, rgba(10, 24, 40, 0.98) 0%, rgba(30, 144, 255, 0.15) 100%)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(64, 224, 208, 0.2)',
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" style={{ color: '#40E0D0' }} />
            Connect Financial Account
          </DialogTitle>
          <DialogDescription>
            Connect your brokerage, crypto, or banking account to sync your portfolio.
          </DialogDescription>
        </DialogHeader>

        <div 
          className="flex items-start gap-3 p-3 rounded-lg mb-4"
          style={{
            background: 'rgba(255, 165, 0, 0.1)',
            border: '1px solid rgba(255, 165, 0, 0.3)',
          }}
        >
          <ShieldCheck className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-400">Encrypted Storage</p>
            <p className="text-xs text-muted-foreground mt-1">
              All credentials are encrypted using AES-256 before storage. We never store plain-text API keys.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="provider">Provider</Label>
            <Select
              onValueChange={(value) => {
                setValue('provider', value as any);
                setSelectedProvider(value);
              }}
            >
              <SelectTrigger id="provider" data-testid="select-provider">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PROVIDER_INFO).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    {info.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.provider && (
              <p className="text-sm text-red-400 mt-1">{errors.provider.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="accountType">Account Type</Label>
            <Select onValueChange={(value) => setValue('accountType', value as any)}>
              <SelectTrigger id="accountType" data-testid="select-account-type">
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                {(selectedProvider && PROVIDER_INFO[selectedProvider]?.types || ['brokerage', 'crypto', 'banking', 'business']).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.accountType && (
              <p className="text-sm text-red-400 mt-1">{errors.accountType.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="accountId">Account ID</Label>
            <Input
              id="accountId"
              {...register('accountId')}
              placeholder="External account identifier"
              data-testid="input-account-id"
            />
            {errors.accountId && (
              <p className="text-sm text-red-400 mt-1">{errors.accountId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              {...register('apiKey')}
              type="password"
              placeholder="Your API key"
              data-testid="input-api-key"
            />
            {errors.apiKey && (
              <p className="text-sm text-red-400 mt-1">{errors.apiKey.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="apiSecret">API Secret</Label>
            <Input
              id="apiSecret"
              {...register('apiSecret')}
              type="password"
              placeholder="Your API secret"
              data-testid="input-api-secret"
            />
            {errors.apiSecret && (
              <p className="text-sm text-red-400 mt-1">{errors.apiSecret.message}</p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={connectAccount.isPending}
              data-testid="button-connect-account"
            >
              {connectAccount.isPending ? 'Connecting...' : 'Connect Account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
