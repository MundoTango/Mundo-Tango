import { useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { DollarSign, TrendingUp, TrendingDown, PieChart, Lightbulb, Check, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function AIBudgetBuilder() {
  const { toast } = useToast();
  const [months, setMonths] = useState(6);

  const analyzeMutation = useMutation({
    mutationFn: async (months: number) => {
      return await apiRequest('/api/finance/analyze', 'POST', { months });
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis Complete! 📊",
        description: "Your spending analysis is ready.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const applyBudgetMutation = useMutation({
    mutationFn: async (budget: any) => {
      return await apiRequest('/api/finance/budget/apply', 'POST', { budget });
    },
    onSuccess: () => {
      toast({
        title: "Budget Applied! ✅",
        description: "Your new budget has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/finance/budgets'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Apply Budget",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleAnalyze = () => {
    analyzeMutation.mutate(months);
  };

  const handleApplyBudget = (budget: any) => {
    applyBudgetMutation.mutate(budget);
  };

  const analysis = analyzeMutation.data;

  return (
    <PageLayout title="AI Budget Builder" showBreadcrumbs>
      <>
        <SEO
          title="AI Budget Builder - Mundo Tango"
          description="Build a smart budget with AI-powered spending analysis and recommendations"
        />

        <div className="container mx-auto max-w-6xl space-y-6 p-6" data-testid="page-budget-builder">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">AI Budget Builder</h1>
            <p className="text-muted-foreground">
              Analyze your spending and get personalized budget recommendations
            </p>
          </div>

          {/* Analysis Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-blue-500" />
                Spending Analysis
              </CardTitle>
              <CardDescription>
                Review spending patterns from the last {months} months
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                {[3, 6, 12].map((m) => (
                  <Button
                    key={m}
                    variant={months === m ? 'default' : 'outline'}
                    onClick={() => setMonths(m)}
                    data-testid={`button-months-${m}`}
                  >
                    {m} months
                  </Button>
                ))}
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={analyzeMutation.isPending}
                className="w-full"
                data-testid="button-analyze"
              >
                {analyzeMutation.isPending ? 'Analyzing...' : 'Analyze My Spending'}
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysis && (
            <>
              {/* Spending Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Spending Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Monthly Income</div>
                      <div className="text-2xl font-bold text-green-600">
                        ${analysis.income.toFixed(0)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Monthly Expenses</div>
                      <div className="text-2xl font-bold text-red-600">
                        ${analysis.totalExpenses.toFixed(0)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Potential Savings</div>
                      <div className="text-2xl font-bold text-blue-600">
                        ${analysis.savingsPotential.toFixed(0)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {((analysis.savingsPotential / analysis.income) * 100).toFixed(1)}% of income
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Spending by Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.spending?.map((category: any) => (
                      <div key={category.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="font-medium">{category.category}</div>
                            <div className="text-sm text-muted-foreground">
                              {category.transactionCount} transaction{category.transactionCount !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">${category.averageMonthly.toFixed(0)}/mo</div>
                            <div className="text-xs text-muted-foreground">
                              {((category.averageMonthly / analysis.income) * 100).toFixed(1)}% of income
                            </div>
                          </div>
                        </div>
                        <Progress 
                          value={(category.averageMonthly / analysis.income) * 100} 
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.recommendations?.map((rec: string, idx: number) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <div className="mt-0.5">
                          <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Lightbulb className="h-3 w-3 text-blue-500" />
                          </div>
                        </div>
                        <p className="text-sm flex-1">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Proposed Budget (50/30/20 Rule) */}
              {analysis.proposedBudget && (
                <Card>
                  <CardHeader>
                    <CardTitle>Proposed Budget (50/30/20 Rule)</CardTitle>
                    <CardDescription>
                      A balanced budget based on the 50/30/20 financial rule
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Needs (50%)</span>
                          <Badge variant="outline">Essential</Badge>
                        </div>
                        <div className="text-2xl font-bold">
                          ${analysis.proposedBudget.needs.toFixed(0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Rent, utilities, groceries, insurance
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Wants (30%)</span>
                          <Badge variant="outline">Flexible</Badge>
                        </div>
                        <div className="text-2xl font-bold">
                          ${analysis.proposedBudget.wants.toFixed(0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Entertainment, dining out, hobbies
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Savings (20%)</span>
                          <Badge variant="default">Important</Badge>
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          ${analysis.proposedBudget.savings.toFixed(0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Emergency fund, investments, debt repayment
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleApplyBudget(analysis.proposedBudget)}
                      disabled={applyBudgetMutation.isPending}
                      className="w-full"
                      data-testid="button-apply-budget"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {applyBudgetMutation.isPending ? 'Applying...' : 'Apply This Budget'}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Empty State */}
          {!analysis && !analyzeMutation.isPending && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <DollarSign className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Analysis Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Click "Analyze My Spending" above to get started
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </>
    </PageLayout>
  );
}
