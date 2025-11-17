import { db } from '../db';
import { financialTransactions, budgets, users } from '@shared/schema';
import { eq, and, gte, sql, desc } from 'drizzle-orm';
import { subMonths, startOfMonth } from 'date-fns';

interface BudgetAnalysis {
  period: { months: number; start: Date; end: Date };
  income: { average: number; total: number };
  spending: SpendingCategory[];
  savingsPotential: number;
  recommendations: string[];
  generatedBudget: Budget;
}

interface SpendingCategory {
  category: string;
  averageMonthly: number;
  totalSpent: number;
  transactionCount: number;
}

interface Budget {
  totalIncome: number;
  categories: Array<{
    name: string;
    budgeted: number;
    type: 'need' | 'want' | 'savings';
  }>;
  savingsGoal: number;
  recommendations: string[];
}

export class AIBudgetBuilder {
  async analyzeSpending(userId: number, months: number = 6): Promise<BudgetAnalysis> {
    const startDate = subMonths(new Date(), months);

    const transactions = await db.select()
      .from(financialTransactions)
      .where(and(
        eq(financialTransactions.userId, userId),
        gte(financialTransactions.date, startDate)
      ))
      .orderBy(desc(financialTransactions.date));

    const categorized = this.categorizeTransactions(transactions);
    const spending = this.calculateMonthlyAverages(categorized, months);
    
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
    const averageIncome = totalIncome / months;

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
    const averageExpenses = totalExpenses / months;

    const savingsPotential = this.calculateSavingsPotential(spending, averageIncome);
    const recommendations = this.generateRecommendations(spending, averageIncome);
    const generatedBudget = this.generateBudget(averageIncome, spending);

    return {
      period: { months, start: startDate, end: new Date() },
      income: { average: averageIncome, total: totalIncome },
      spending,
      savingsPotential,
      recommendations,
      generatedBudget
    };
  }

  private categorizeTransactions(transactions: any[]): any[] {
    const categoryKeywords = {
      'Housing': ['rent', 'mortgage', 'property', 'utilities', 'electric', 'water', 'gas'],
      'Food': ['grocery', 'supermarket', 'restaurant', 'cafe', 'food', 'dining'],
      'Transportation': ['gas', 'uber', 'lyft', 'metro', 'parking', 'car'],
      'Entertainment': ['netflix', 'spotify', 'movie', 'concert', 'game'],
      'Tango': ['tango', 'milonga', 'dance', 'lesson'],
      'Shopping': ['amazon', 'store', 'mall', 'clothing'],
      'Health': ['pharmacy', 'doctor', 'hospital', 'gym', 'fitness'],
      'Other': []
    };

    return transactions.map(txn => {
      let category = txn.category || 'Other';
      
      if (category === 'Other' || !category) {
        const description = (txn.description || '').toLowerCase();
        const merchant = (txn.merchant || '').toLowerCase();
        
        for (const [cat, keywords] of Object.entries(categoryKeywords)) {
          if (keywords.some(kw => description.includes(kw) || merchant.includes(kw))) {
            category = cat;
            break;
          }
        }
      }

      return { ...txn, category };
    });
  }

  private calculateMonthlyAverages(transactions: any[], months: number): SpendingCategory[] {
    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const category = t.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(t);
        return acc;
      }, {} as Record<string, any[]>);

    return Object.entries(expensesByCategory).map(([category, txns]) => {
      const txnArray = txns as any[];
      const totalSpent = txnArray.reduce((sum: number, t: any) => sum + parseFloat(t.amount.toString()), 0);
      return {
        category,
        averageMonthly: totalSpent / months,
        totalSpent,
        transactionCount: txnArray.length
      };
    });
  }

  private calculateSavingsPotential(spending: SpendingCategory[], income: number): number {
    const totalExpenses = spending.reduce((sum, s) => sum + s.averageMonthly, 0);
    
    const discretionaryCategories = ['Entertainment', 'Tango', 'Shopping'];
    const discretionarySpending = spending
      .filter(s => discretionaryCategories.includes(s.category))
      .reduce((sum, s) => sum + s.averageMonthly, 0);

    const potentialSavings = discretionarySpending * 0.25;
    
    return potentialSavings;
  }

  private generateRecommendations(spending: SpendingCategory[], income: number): string[] {
    const recommendations = [];

    const totalExpenses = spending.reduce((sum, s) => sum + s.averageMonthly, 0);
    const savingsRate = income > 0 ? ((income - totalExpenses) / income) * 100 : 0;

    if (savingsRate < 10) {
      recommendations.push('Your savings rate is below 10%. Aim to save at least 20% of your income.');
    }

    const foodSpending = spending.find(s => s.category === 'Food');
    if (foodSpending && foodSpending.averageMonthly / income > 0.15) {
      recommendations.push(`You're spending ${((foodSpending.averageMonthly / income) * 100).toFixed(0)}% on food. Try meal planning to reduce costs.`);
    }

    const subscriptions = spending.filter(s => 
      ['Entertainment', 'Streaming'].includes(s.category) && 
      s.transactionCount > 3
    );
    if (subscriptions.length > 3) {
      recommendations.push(`You have ${subscriptions.length} active subscriptions. Review and cancel unused services.`);
    }

    const tangoSpending = spending.find(s => s.category === 'Tango');
    if (tangoSpending && tangoSpending.averageMonthly > income * 0.10) {
      recommendations.push('Consider budgeting your tango expenses to keep them under 10% of income.');
    }

    return recommendations;
  }

  private generateBudget(income: number, spending: SpendingCategory[]): Budget {
    const needs = income * 0.50;
    const wants = income * 0.30;
    const savings = income * 0.20;

    const needsCategories = ['Housing', 'Food', 'Transportation', 'Health'];
    const wantsCategories = ['Entertainment', 'Tango', 'Shopping'];

    const categories = [
      { name: 'Housing', budgeted: needs * 0.40, type: 'need' as const },
      { name: 'Food', budgeted: needs * 0.25, type: 'need' as const },
      { name: 'Transportation', budgeted: needs * 0.20, type: 'need' as const },
      { name: 'Health', budgeted: needs * 0.15, type: 'need' as const },
      { name: 'Entertainment', budgeted: wants * 0.40, type: 'want' as const },
      { name: 'Tango', budgeted: wants * 0.30, type: 'want' as const },
      { name: 'Shopping', budgeted: wants * 0.30, type: 'want' as const },
      { name: 'Savings', budgeted: savings, type: 'savings' as const }
    ];

    return {
      totalIncome: income,
      categories,
      savingsGoal: savings,
      recommendations: [
        'Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings',
        'Review your budget monthly and adjust as needed',
        'Build an emergency fund covering 3-6 months of expenses'
      ]
    };
  }

  async applyBudget(userId: number, budget: Budget): Promise<void> {
    const startDate = startOfMonth(new Date());
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    for (const category of budget.categories) {
      await db.insert(budgets).values({
        userId,
        category: category.name,
        budgetedAmount: category.budgeted.toFixed(2),
        spentAmount: '0',
        period: 'monthly',
        startDate,
        endDate
      });
    }
  }
}
