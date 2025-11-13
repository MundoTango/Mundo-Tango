import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, Users, PieChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BudgetItem {
  category: string;
  amount: number;
}

interface BudgetCalculatorProps {
  totalBudget?: number;
  expenses: BudgetItem[];
  participants?: number;
  currency?: string;
}

export function BudgetCalculator({
  totalBudget = 0,
  expenses = [],
  participants = 1,
  currency = "USD",
}: BudgetCalculatorProps) {
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const remaining = totalBudget - totalExpenses;
  const percentageUsed = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;
  const perPerson = totalExpenses / Math.max(participants, 1);

  // Group expenses by category
  const categoryTotals = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryColors: Record<string, string> = {
    accommodation: "bg-blue-500",
    transport: "bg-purple-500",
    food: "bg-green-500",
    activities: "bg-orange-500",
    events: "bg-pink-500",
    other: "bg-gray-500",
  };

  return (
    <div className="space-y-4">
      <Card data-testid="budget-calculator">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Budget</p>
              <p className="text-2xl font-bold" data-testid="text-total-budget">
                {currency} {totalBudget.toFixed(2)}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-primary" data-testid="text-total-expenses">
                {currency} {totalExpenses.toFixed(2)}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p
                className={`text-2xl font-bold ${remaining >= 0 ? "text-green-600" : "text-destructive"}`}
                data-testid="text-remaining-budget"
              >
                {currency} {remaining.toFixed(2)}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Users className="h-4 w-4" />
                Per Person
              </p>
              <p className="text-2xl font-bold" data-testid="text-per-person">
                {currency} {perPerson.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Budget Usage</span>
              <span className="font-medium">{percentageUsed.toFixed(1)}%</span>
            </div>
            <Progress
              value={Math.min(percentageUsed, 100)}
              className="h-2"
              data-testid="progress-budget-usage"
            />
            {percentageUsed > 100 && (
              <p className="text-sm text-destructive">
                ⚠️ Over budget by {currency} {(totalExpenses - totalBudget).toFixed(2)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {Object.keys(categoryTotals).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Expenses by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(categoryTotals)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => {
                const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                return (
                  <div key={category} className="space-y-1" data-testid={`category-${category}`}>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${categoryColors[category] || "bg-gray-500"}`} />
                        <span className="capitalize">{category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {currency} {amount.toFixed(2)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {percentage.toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                    <Progress
                      value={percentage}
                      className="h-1"
                    />
                  </div>
                );
              })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
