import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, RefreshCw } from 'lucide-react';

interface TierLimit {
  id: number;
  tierName: string;
  featureFlagId: number;
  limitValue: number | null;
  isUnlimited: boolean | null;
}

interface FeatureFlag {
  id: number;
  key: string;
  name: string;
  description: string | null;
  flagType: string;
}

const TIER_NAMES = ['free', 'student', 'creator', 'professional', 'teacher', 'organizer', 'venue', 'enterprise'];

export default function PricingManagerPage() {
  const { toast } = useToast();
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const { data: limitsData, isLoading: limitsLoading } = useQuery({
    queryKey: ['/api/pricing/admin/tier-limits'],
  });

  const { data: featuresData, isLoading: featuresLoading } = useQuery({
    queryKey: ['/api/feature-flags'],
  });

  const toggleMutation = useMutation({
    mutationFn: async (data: {
      tierName: string;
      featureFlagId: number;
      limitValue: number | null;
      isUnlimited: boolean;
    }) => {
      const res = await apiRequest('POST', '/api/pricing/admin/toggle-feature-for-tier', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pricing/admin/tier-limits'] });
      toast({
        title: 'Success',
        description: 'Feature limit updated',
      });
      setEditingCell(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update feature limit',
        variant: 'destructive',
      });
    },
  });

  const handleCellClick = (tierName: string, featureFlagId: number, currentValue: number | null, isUnlimited: boolean) => {
    const cellId = `${tierName}-${featureFlagId}`;
    setEditingCell(cellId);
    setEditValue(isUnlimited ? 'unlimited' : (currentValue?.toString() || '0'));
  };

  const handleSaveCell = (tierName: string, featureFlagId: number) => {
    const isUnlimited = editValue.toLowerCase() === 'unlimited';
    const limitValue = isUnlimited ? null : parseInt(editValue, 10);

    if (!isUnlimited && (limitValue === null || isNaN(limitValue))) {
      toast({
        title: 'Invalid Value',
        description: 'Please enter a number or "unlimited"',
        variant: 'destructive',
      });
      return;
    }

    toggleMutation.mutate({
      tierName,
      featureFlagId,
      limitValue,
      isUnlimited,
    });
  };

  if (limitsLoading || featuresLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const matrix: Record<string, Record<number, { limitValue: number | null; isUnlimited: boolean }>> = (limitsData as any)?.matrix || {};
  const features: FeatureFlag[] = (featuresData as any)?.flags || [];

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl" data-testid="page-pricing-manager">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="w-6 h-6 text-primary" data-testid="icon-settings" />
            </div>
            <div>
              <CardTitle className="text-2xl" data-testid="text-page-title">
                Pricing & Feature Manager
              </CardTitle>
              <CardDescription data-testid="text-page-description">
                Configure feature limits for each pricing tier. Click a cell to edit, type "unlimited" for no limits.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" data-testid="table-tier-limits">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold sticky left-0 bg-card z-10" data-testid="header-feature">
                    Feature
                  </th>
                  {TIER_NAMES.map((tier) => (
                    <th key={tier} className="text-center p-3 font-semibold capitalize" data-testid={`header-tier-${tier}`}>
                      <Badge variant="outline" data-testid={`badge-tier-${tier}`}>{tier}</Badge>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((feature) => (
                  <tr key={feature.id} className="border-b hover-elevate" data-testid={`row-feature-${feature.id}`}>
                    <td className="p-3 sticky left-0 bg-card z-10" data-testid={`cell-feature-name-${feature.id}`}>
                      <div>
                        <div className="font-medium">{feature.name}</div>
                        <div className="text-xs text-muted-foreground">{feature.key}</div>
                      </div>
                    </td>
                    {TIER_NAMES.map((tierName) => {
                      const cellId = `${tierName}-${feature.id}`;
                      const tierLimit = matrix[tierName]?.[feature.id];
                      const limitValue = tierLimit?.limitValue;
                      const isUnlimited = tierLimit?.isUnlimited || false;
                      const isEditing = editingCell === cellId;

                      return (
                        <td
                          key={cellId}
                          className="p-2 text-center"
                          data-testid={`cell-${tierName}-${feature.id}`}
                        >
                          {isEditing ? (
                            <div className="flex items-center gap-1 justify-center">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="h-8 w-24 text-center"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveCell(tierName, feature.id);
                                  } else if (e.key === 'Escape') {
                                    setEditingCell(null);
                                  }
                                }}
                                data-testid={`input-edit-${cellId}`}
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => handleSaveCell(tierName, feature.id)}
                                disabled={toggleMutation.isPending}
                                data-testid={`button-save-${cellId}`}
                              >
                                <Save className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleCellClick(tierName, feature.id, limitValue, isUnlimited)}
                              className="px-3 py-1 rounded hover-elevate min-w-[60px]"
                              data-testid={`button-edit-${cellId}`}
                            >
                              {isUnlimited ? (
                                <Badge variant="default" className="bg-primary" data-testid={`badge-unlimited-${cellId}`}>
                                  Unlimited
                                </Badge>
                              ) : limitValue !== null && limitValue !== undefined ? (
                                <span className="font-mono" data-testid={`text-limit-${cellId}`}>{limitValue}</span>
                              ) : (
                                <span className="text-muted-foreground" data-testid={`text-not-set-${cellId}`}>—</span>
                              )}
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg" data-testid="info-panel">
            <h4 className="font-semibold mb-2 flex items-center gap-2" data-testid="text-usage-title">
              <RefreshCw className="w-4 h-4" />
              Usage Instructions
            </h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li data-testid="info-item-1">• Click any cell to edit the limit for that feature and tier</li>
              <li data-testid="info-item-2">• Enter a number (e.g., "100") or type "unlimited" for no limits</li>
              <li data-testid="info-item-3">• Press Enter to save or Escape to cancel</li>
              <li data-testid="info-item-4">• Features are automatically enforced via FeatureFlagService</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
