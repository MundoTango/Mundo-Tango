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
import { Settings, Save, RefreshCw, DollarSign } from 'lucide-react';
import { SelfHealingErrorBoundary } from '@/components/SelfHealingErrorBoundary';
import { motion } from 'framer-motion';

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
      <div className="min-h-screen bg-background">
        {/* Hero Skeleton */}
        <div className="relative h-[50vh] bg-muted animate-pulse" />
        <div className="container mx-auto py-12 px-6 max-w-7xl">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
          <Skeleton className="h-96 w-full mt-8" />
        </div>
      </div>
    );
  }

  const matrix: Record<string, Record<number, { limitValue: number | null; isUnlimited: boolean }>> = (limitsData as any)?.matrix || {};
  const features: FeatureFlag[] = (featuresData as any)?.flags || [];

  return (
    <SelfHealingErrorBoundary pageName="Pricing Manager" fallbackRoute="/admin">
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=1600&h=900&fit=crop')`
          }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                <DollarSign className="w-3 h-3 mr-1.5" />
                Platform Administration
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                Pricing Manager
              </h1>
              
              <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-page-description">
                Configure feature limits and access controls for each pricing tier
              </p>
            </motion.div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-background py-12 px-6">
          <div className="container mx-auto max-w-7xl" data-testid="page-pricing-manager">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="p-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Settings className="w-6 h-6 text-primary" data-testid="icon-settings" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-serif font-bold" data-testid="text-card-title">
                        Feature Configuration Matrix
                      </CardTitle>
                      <CardDescription className="text-base mt-2" data-testid="text-page-description">
                        Click a cell to edit, type "unlimited" for no limits. Press Enter to save or Escape to cancel.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
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

                  <div className="mt-8 p-6 bg-muted/50 rounded-lg" data-testid="info-panel">
                    <h4 className="text-lg font-serif font-bold mb-4 flex items-center gap-2" data-testid="text-usage-title">
                      <RefreshCw className="w-5 h-5" />
                      Usage Instructions
                    </h4>
                    <ul className="space-y-2 text-muted-foreground leading-relaxed">
                      <li data-testid="info-item-1">• Click any cell to edit the limit for that feature and tier</li>
                      <li data-testid="info-item-2">• Enter a number (e.g., "100") or type "unlimited" for no limits</li>
                      <li data-testid="info-item-3">• Press Enter to save or Escape to cancel</li>
                      <li data-testid="info-item-4">• Features are automatically enforced via FeatureFlagService</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </SelfHealingErrorBoundary>
  );
}
