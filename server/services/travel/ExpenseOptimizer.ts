import { RateLimitedAIOrchestrator } from '../ai/integration/rate-limited-orchestrator';

interface Expense {
  id: number;
  category: 'accommodation' | 'food' | 'activities' | 'transport' | 'other';
  amount: number;
  currency: string;
  description: string;
  date: string;
  paidBy?: number;
}

interface BudgetAllocation {
  accommodation: { amount: number; percentage: number };
  food: { amount: number; percentage: number };
  activities: { amount: number; percentage: number };
  transport: { amount: number; percentage: number };
  other: { amount: number; percentage: number };
}

interface ExpenseAnalysis {
  totalSpent: number;
  budgetAllocations: BudgetAllocation;
  savings: string[];
  warnings: string[];
  categoryInsights: Record<string, string>;
  splitSuggestions?: Array<{ userId: number; amount: number; reason: string }>;
}

export class ExpenseOptimizer {
  private aiOrchestrator: RateLimitedAIOrchestrator;

  constructor() {
    this.aiOrchestrator = new RateLimitedAIOrchestrator();
  }

  async analyzeExpenses(
    tripId: number,
    expenses: Expense[],
    totalBudget: number,
    currency: string = 'USD'
  ): Promise<ExpenseAnalysis> {
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    const prompt = `You are a financial advisor specializing in travel budget optimization. Analyze these trip expenses:

TOTAL BUDGET: ${totalBudget} ${currency}
TOTAL SPENT: ${totalSpent} ${currency}
REMAINING: ${totalBudget - totalSpent} ${currency}

EXPENSES BY CATEGORY:
${this.groupExpensesByCategory(expenses)}

IDEAL BUDGET ALLOCATION:
- Accommodation: 40%
- Food: 30%
- Activities: 20%
- Transport: 10%

Provide:
1. Analysis of current spending vs ideal allocation
2. Cost-saving suggestions (shared accommodations, early bookings, local food)
3. Warnings about overspending categories
4. Currency conversion optimization tips
5. Group expense fairness analysis if multiple payers`;

    const response = await this.aiOrchestrator.smartRoute(
      { prompt, temperature: 0.5, maxTokens: 1500 },
      { useCase: 'reasoning', priority: 'cost' }
    );

    const allocations = this.calculateAllocations(expenses, totalBudget);
    const savings = this.extractSavings(response.content);
    const warnings = this.extractWarnings(response.content);

    return {
      totalSpent,
      budgetAllocations: allocations,
      savings,
      warnings,
      categoryInsights: this.generateCategoryInsights(expenses),
      splitSuggestions: this.calculateFairSplit(expenses)
    };
  }

  async optimizeCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<{
    convertedAmount: number;
    exchangeRate: number;
    recommendation: string;
  }> {
    const mockRate = 1.0;
    return {
      convertedAmount: amount * mockRate,
      exchangeRate: mockRate,
      recommendation: 'Exchange at local banks for best rates'
    };
  }

  async suggestCostSavings(
    tripType: string,
    duration: number,
    travelers: number
  ): Promise<string[]> {
    const prompt = `Suggest 5 cost-saving strategies for a ${duration}-day ${tripType} trip with ${travelers} travelers.`;

    const response = await this.aiOrchestrator.smartRoute(
      { prompt, temperature: 0.7, maxTokens: 500 },
      { useCase: 'chat', priority: 'speed' }
    );

    return response.content.split('\n').filter(line => line.trim().startsWith('-')).map(l => l.substring(1).trim());
  }

  private groupExpensesByCategory(expenses: Expense[]): string {
    const grouped = expenses.reduce((acc, exp) => {
      if (!acc[exp.category]) acc[exp.category] = [];
      acc[exp.category].push(exp);
      return acc;
    }, {} as Record<string, Expense[]>);

    return Object.entries(grouped)
      .map(([cat, exps]) => {
        const total = exps.reduce((sum, e) => sum + e.amount, 0);
        return `${cat}: $${total.toFixed(2)} (${exps.length} expenses)`;
      })
      .join('\n');
  }

  private calculateAllocations(expenses: Expense[], totalBudget: number): BudgetAllocation {
    const byCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    const createAllocation = (cat: string) => ({
      amount: byCategory[cat] || 0,
      percentage: ((byCategory[cat] || 0) / totalBudget) * 100
    });

    return {
      accommodation: createAllocation('accommodation'),
      food: createAllocation('food'),
      activities: createAllocation('activities'),
      transport: createAllocation('transport'),
      other: createAllocation('other')
    };
  }

  private extractSavings(content: string): string[] {
    const savings: string[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      if (line.toLowerCase().includes('save') || line.toLowerCase().includes('cheaper')) {
        savings.push(line.trim());
      }
    }

    return savings.slice(0, 5);
  }

  private extractWarnings(content: string): string[] {
    const warnings: string[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      if (line.toLowerCase().includes('warning') || line.toLowerCase().includes('overspend')) {
        warnings.push(line.trim());
      }
    }

    return warnings;
  }

  private generateCategoryInsights(expenses: Expense[]): Record<string, string> {
    const insights: Record<string, string> = {};

    const byCategory = expenses.reduce((acc, exp) => {
      if (!acc[exp.category]) acc[exp.category] = [];
      acc[exp.category].push(exp);
      return acc;
    }, {} as Record<string, Expense[]>);

    for (const [category, exps] of Object.entries(byCategory)) {
      const total = exps.reduce((sum, e) => sum + e.amount, 0);
      const avg = total / exps.length;
      insights[category] = `${exps.length} expenses totaling $${total.toFixed(2)} (avg: $${avg.toFixed(2)})`;
    }

    return insights;
  }

  private calculateFairSplit(expenses: Expense[]): Array<{ userId: number; amount: number; reason: string }> {
    const payers = expenses.filter(e => e.paidBy).reduce((acc, exp) => {
      const payer = exp.paidBy!;
      acc[payer] = (acc[payer] || 0) + exp.amount;
      return acc;
    }, {} as Record<number, number>);

    const total = Object.values(payers).reduce((sum, amt) => sum + amt, 0);
    const numPayers = Object.keys(payers).length;
    const perPerson = total / Math.max(numPayers, 1);

    return Object.entries(payers).map(([userId, paid]) => ({
      userId: parseInt(userId),
      amount: paid - perPerson,
      reason: paid > perPerson ? 'is owed' : 'owes'
    }));
  }
}

export const expenseOptimizer = new ExpenseOptimizer();
