import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Flag, TrendingUp, Users, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  environment: string;
  usageCount?: number;
  deprecated: boolean;
}

export default function FeatureFlagsPage() {
  const { toast } = useToast();
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);

  const { data: flags, isLoading } = useQuery<FeatureFlag[]>({
    queryKey: ['/api/admin/feature-flags'],
  });

  const toggleFlagMutation = useMutation({
    mutationFn: async ({ flagId, enabled }: { flagId: string; enabled: boolean }) => {
      return apiRequest(`/api/admin/feature-flags/${flagId}`, {
        method: 'PUT',
        body: JSON.stringify({ enabled }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/feature-flags'] });
      toast({
        title: 'Feature Flag Updated',
        description: 'The feature flag has been successfully updated.',
      });
    },
  });

  const updateRolloutMutation = useMutation({
    mutationFn: async ({ flagId, percentage }: { flagId: string; percentage: number }) => {
      return apiRequest(`/api/admin/feature-flags/${flagId}/rollout`, {
        method: 'PUT',
        body: JSON.stringify({ rolloutPercentage: percentage }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/feature-flags'] });
      toast({
        title: 'Rollout Updated',
        description: 'The rollout percentage has been updated.',
      });
    },
  });

  return (
    <div className="space-y-8" data-testid="page-feature-flags">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Feature Flags</h1>
          <p className="text-muted-foreground mt-2">
            Manage feature toggles and gradual rollouts
          </p>
        </div>
        <Button data-testid="button-create-flag">
          <Flag className="h-4 w-4 mr-2" />
          Create Flag
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card data-testid="card-total-flags">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Flags</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flags?.length || 0}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-enabled-flags">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enabled</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {flags?.filter(f => f.enabled).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-deprecated-flags">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deprecated</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {flags?.filter(f => f.deprecated).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-feature-flags-list">
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
          <CardDescription>Toggle features and control rollout</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {flags?.map((flag) => (
                <div
                  key={flag.id}
                  className="p-4 rounded-lg border space-y-4"
                  data-testid={`flag-${flag.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{flag.name}</h4>
                        {flag.deprecated && (
                          <Badge variant="destructive" data-testid={`badge-deprecated-${flag.id}`}>
                            Deprecated
                          </Badge>
                        )}
                        {flag.enabled && (
                          <Badge variant="default" data-testid={`badge-enabled-${flag.id}`}>
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{flag.description}</p>
                      {flag.usageCount !== undefined && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {flag.usageCount.toLocaleString()} users affected
                        </div>
                      )}
                    </div>
                    <Switch
                      checked={flag.enabled}
                      onCheckedChange={(checked) => 
                        toggleFlagMutation.mutate({ flagId: flag.id, enabled: checked })
                      }
                      data-testid={`switch-${flag.id}`}
                    />
                  </div>

                  {flag.enabled && (
                    <div className="space-y-2">
                      <Label>
                        Rollout: {flag.rolloutPercentage}% of users
                      </Label>
                      <Slider
                        value={[flag.rolloutPercentage]}
                        onValueChange={([value]) => 
                          updateRolloutMutation.mutate({ flagId: flag.id, percentage: value })
                        }
                        max={100}
                        step={5}
                        className="w-full"
                        data-testid={`slider-rollout-${flag.id}`}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
