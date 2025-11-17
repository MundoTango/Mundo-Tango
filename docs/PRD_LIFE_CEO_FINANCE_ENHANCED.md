# PRD: LIFE CEO Finance Agent Enhanced
**Version:** 2.0  
**Created:** November 17, 2025  
**Enhancement:** UseOrigin AI Budget Builder & Financial Planning  
**Status:** Implementation Ready

---

## 1. EXECUTIVE SUMMARY

### 1.1 Vision
Enhance existing LIFE CEO Finance Agent with UseOrigin's AI Budget Builder, cash flow tracking, investment portfolio management, and estate planning tools to create a comprehensive financial wellness platform.

### 1.2 Current State
**Existing:** `client/src/pages/life-ceo/FinanceAgentPage.tsx`
- Basic expense tracking
- Income/expense categorization
- Financial goal setting
- Part of 16 LIFE CEO agents

### 1.3 The Gap
Users use external tools:
- UseOrigin for AI budgeting ($12.99/mo)
- Personal Capital for investment tracking
- Mint for cash flow analysis
- **Total external cost:** $15-30/month

### 1.4 The Solution
Add to Finance Agent:
- **AI Budget Builder** (analyze 6-month spending, generate budget)
- **Cash Flow Tracking** (real-time income/expense monitoring)
- **Investment Portfolio Tracking** (stocks, crypto, real estate)
- **Savings Potential Calculator** (AI-driven recommendations)
- **Estate Planning Tools** (will, beneficiaries, asset allocation)

**Benefits:**
- ✅ All financial tools in one place
- ✅ AI-powered insights via Context Service
- ✅ Stripe integration for payment tracking
- ✅ No external subscriptions needed

---

## 2. FEATURE SPECIFICATIONS

### 2.1 AI Budget Builder

**User Story:** As a tango teacher with irregular income, I need AI to analyze my spending and create a realistic budget.

**Feature:**
- Analyze last 6 months of transactions
- Categorize spending automatically (Housing, Food, Entertainment, Tango, Transportation, etc.)
- Calculate average monthly spending per category
- Identify savings potential (overspending categories, subscriptions to cancel)
- Generate personalized budget recommendations
- Track budget vs. actual spending in real-time
- AI-powered insights: "You spend 40% on dining out. Reduce to 25% to save $200/month."

**Technical Implementation:**
```typescript
// server/services/ai/AIBudgetBuilder.ts
export class AIBudgetBuilder {
  async analyzeSpending(userId: number, months: number = 6): Promise<BudgetAnalysis> {
    // 1. Fetch transactions (last 6 months)
    const transactions = await db.select()
      .from(financialTransactions)
      .where(and(
        eq(financialTransactions.userId, userId),
        gte(financialTransactions.date, subMonths(new Date(), months))
      ))
      .orderBy(desc(financialTransactions.date));
    
    // 2. Auto-categorize using AI
    const categorized = await this.categorizeTransactions(transactions);
    
    // 3. Calculate spending patterns
    const spending = groupBy(categorized, 'category');
    const monthlyAverages = Object.entries(spending).map(([category, txns]) => ({
      category,
      averageMonthly: sum(txns.map(t => t.amount)) / months,
      totalSpent: sum(txns.map(t => t.amount)),
      transactionCount: txns.length
    }));
    
    // 4. Identify savings opportunities via Context Service (RAG)
    const contextService = new ContextService();
    const savingsInsights = await contextService.query({
      query: `Analyze spending patterns and suggest savings: ${JSON.stringify(monthlyAverages)}. Focus on overspending categories and subscriptions.`,
      collection: 'financial_insights'
    });
    
    // 5. Generate budget recommendations
    const totalIncome = await this.calculateAverageIncome(userId, months);
    const budget = this.generateBudget(totalIncome, monthlyAverages, savingsInsights);
    
    return {
      period: { months, start: subMonths(new Date(), months), end: new Date() },
      income: { average: totalIncome, total: totalIncome * months },
      spending: monthlyAverages,
      savingsPotential: savingsInsights.savingsAmount,
      recommendations: savingsInsights.recommendations,
      generatedBudget: budget
    };
  }
  
  private async categorizeTransactions(transactions: Transaction[]): Promise<CategorizedTransaction[]> {
    // Use AI to categorize (e.g., "Starbucks" → "Dining Out")
    const arbitrageEngine = new ArbitrageEngine();
    
    return Promise.all(transactions.map(async (txn) => {
      const category = await arbitrageEngine.execute({
        task: 'categorize_transaction',
        complexity: 'low', // Tier-1 routing (cheap)
        params: {
          description: txn.description,
          amount: txn.amount,
          merchant: txn.merchant
        }
      });
      
      return { ...txn, category: category.category };
    }));
  }
  
  private generateBudget(income: number, spending: SpendingCategory[], insights: any): Budget {
    // 50/30/20 rule: 50% needs, 30% wants, 20% savings
    const needs = income * 0.50; // Housing, Food, Transportation, Utilities
    const wants = income * 0.30; // Entertainment, Tango, Dining Out
    const savings = income * 0.20;
    
    // Allocate to categories based on historical spending + recommendations
    return {
      totalIncome: income,
      categories: [
        { name: 'Housing', budgeted: needs * 0.40, type: 'need' },
        { name: 'Food', budgeted: needs * 0.25, type: 'need' },
        { name: 'Transportation', budgeted: needs * 0.20, type: 'need' },
        { name: 'Utilities', budgeted: needs * 0.15, type: 'need' },
        { name: 'Entertainment', budgeted: wants * 0.40, type: 'want' },
        { name: 'Tango', budgeted: wants * 0.30, type: 'want' },
        { name: 'Dining Out', budgeted: wants * 0.30, type: 'want' },
        { name: 'Savings', budgeted: savings, type: 'savings' }
      ],
      savingsGoal: savings,
      recommendations: insights.recommendations
    };
  }
}
```

**UI Components:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>🧠 AI Budget Builder</CardTitle>
    <CardDescription>Analyzing your last 6 months...</CardDescription>
  </CardHeader>
  <CardContent>
    <Button onClick={analyzeBudget} disabled={isAnalyzing}>
      {isAnalyzing ? 'Analyzing...' : 'Generate AI Budget'}
    </Button>
    
    {analysis && (
      <div className="mt-6 space-y-6">
        {/* Income Summary */}
        <div>
          <h4 className="font-semibold mb-2">💰 Average Monthly Income</h4>
          <div className="text-3xl font-bold text-green-600">
            ${analysis.income.average.toLocaleString()}
          </div>
        </div>
        
        {/* Spending Breakdown */}
        <div>
          <h4 className="font-semibold mb-4">📊 Spending Breakdown</h4>
          {analysis.spending.map(cat => (
            <div key={cat.category} className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">{cat.category}</span>
                <span className="text-sm text-muted-foreground">
                  ${cat.averageMonthly.toFixed(0)}/mo
                </span>
              </div>
              <Progress 
                value={(cat.averageMonthly / analysis.income.average) * 100} 
                className="h-2" 
              />
            </div>
          ))}
        </div>
        
        {/* Savings Potential */}
        <Alert className="bg-green-50 border-green-200">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Savings Potential</AlertTitle>
          <AlertDescription className="text-green-700">
            You could save <strong>${analysis.savingsPotential}/month</strong> by:
            <ul className="list-disc list-inside mt-2">
              {analysis.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
        
        {/* Generated Budget */}
        <div>
          <h4 className="font-semibold mb-3">✅ Recommended Budget (50/30/20 Rule)</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Budgeted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysis.generatedBudget.categories.map(cat => (
                <TableRow key={cat.name}>
                  <TableCell>{cat.name}</TableCell>
                  <TableCell>
                    <Badge variant={cat.type === 'need' ? 'default' : cat.type === 'want' ? 'secondary' : 'outline'}>
                      {cat.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${cat.budgeted.toFixed(0)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <Button onClick={acceptBudget} className="w-full">
          Accept & Apply Budget
        </Button>
      </div>
    )}
  </CardContent>
</Card>
```

---

### 2.2 Cash Flow Tracking

**User Story:** As a freelancer, I need to see real-time cash flow (money in vs. money out).

**Feature:**
- Real-time income/expense tracking
- Cash flow chart (daily, weekly, monthly view)
- Positive/negative balance indicator
- Projected cash flow (based on recurring transactions)
- Low balance alerts ($500 threshold)
- Integration with Stripe (auto-import payments)

**Database Schema:**
```typescript
export const financialTransactions = pgTable('financial_transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'income' | 'expense'
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  description: text('description').notNull(),
  merchant: varchar('merchant', { length: 100 }),
  date: timestamp('date').notNull(),
  recurring: boolean('recurring').default(false),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const budgets = pgTable('budgets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  budgetedAmount: decimal('budgeted_amount', { precision: 10, scale: 2 }).notNull(),
  spentAmount: decimal('spent_amount', { precision: 10, scale: 2 }).default('0').notNull(),
  period: varchar('period', { length: 20 }).notNull(), // 'monthly' | 'yearly'
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});
```

**UI - Cash Flow Chart:**
```tsx
<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={cashFlowData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Area 
      type="monotone" 
      dataKey="income" 
      stackId="1" 
      stroke="#10b981" 
      fill="#10b981" 
      fillOpacity={0.6} 
    />
    <Area 
      type="monotone" 
      dataKey="expenses" 
      stackId="2" 
      stroke="#ef4444" 
      fill="#ef4444" 
      fillOpacity={0.6} 
    />
    <Line 
      type="monotone" 
      dataKey="balance" 
      stroke="#3b82f6" 
      strokeWidth={2} 
    />
  </AreaChart>
</ResponsiveContainer>
```

---

### 2.3 Investment Portfolio Tracking

**User Story:** As an investor, I want to track my stocks, crypto, and real estate in one place.

**Feature:**
- Add investments manually (ticker symbol, quantity, purchase price)
- Auto-fetch current prices (via Alpha Vantage API for stocks, CoinGecko for crypto)
- Portfolio value calculation (real-time)
- Performance metrics: Total gain/loss, % return, daily change
- Asset allocation pie chart (stocks, crypto, real estate, cash)
- Diversification score

**Database Schema:**
```typescript
export const investments = pgTable('investments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  assetType: varchar('asset_type', { length: 20 }).notNull(), // 'stock', 'crypto', 'real_estate', 'cash'
  symbol: varchar('symbol', { length: 20 }), // 'AAPL', 'BTC', null for real estate
  quantity: decimal('quantity', { precision: 18, scale: 8 }).notNull(),
  purchasePrice: decimal('purchase_price', { precision: 10, scale: 2 }).notNull(),
  currentPrice: decimal('current_price', { precision: 10, scale: 2 }),
  lastUpdated: timestamp('last_updated'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});
```

**Auto-Price Update (BullMQ Worker):**
```typescript
// server/workers/investmentPriceUpdater.ts
export async function updateInvestmentPrices() {
  const investments = await db.select().from(investments);
  
  for (const investment of investments) {
    if (investment.assetType === 'stock') {
      const price = await fetchStockPrice(investment.symbol!);
      await db.update(investments)
        .set({ currentPrice: price, lastUpdated: new Date() })
        .where(eq(investments.id, investment.id));
    } else if (investment.assetType === 'crypto') {
      const price = await fetchCryptoPrice(investment.symbol!);
      await db.update(investments)
        .set({ currentPrice: price, lastUpdated: new Date() })
        .where(eq(investments.id, investment.id));
    }
  }
}

// Schedule: Every 15 minutes during market hours
investmentQueue.add('update-prices', {}, { repeat: { cron: '*/15 9-16 * * 1-5' } });
```

---

### 2.4 Savings Potential Calculator

**User Story:** As a saver, I want to know how much I could save by optimizing spending.

**Feature:**
- AI analyzes budget vs. actual spending
- Identifies overspending categories
- Suggests subscription cancellations (detects recurring charges)
- Shows "What if" scenarios: "If you reduce dining out by 25%, you save $150/month"
- Gamification: "You saved $200 this month! 🎉"

---

### 2.5 Estate Planning Tools

**User Story:** As a responsible adult, I need to plan my estate (will, beneficiaries).

**Feature:**
- Digital will builder (guided questions)
- Beneficiary management (add family members, allocate assets)
- Asset inventory (real estate, investments, bank accounts)
- Document vault (upload will, trust docs, insurance policies)
- Emergency contacts

**Note:** This is informational only, not legal advice. Users should consult attorney for binding documents.

---

## 3. SUCCESS METRICS

### 3.1 User Adoption
- AI Budget Builder usage: Target >50% of Finance Agent users
- Investment tracking: Target >20% of users add investments
- Weekly cash flow check-ins: Target >60% engagement

### 3.2 Financial Impact
- User-reported savings increase: Target $100+/month average
- Budget adherence: Target >70% stay within budget
- Investment portfolio growth visibility: Target >90% satisfaction

---

## 4. IMPLEMENTATION TIMELINE

**Week 11 Day 4-5:**
- Database schema migration (3 new tables)
- AIBudgetBuilder.ts service
- Cash flow tracking API + UI
- Investment tracking API + UI
- BullMQ price updater worker

**Testing:** E2E flows for budget creation, transaction tracking, investment updates

---

**END OF PRD**

**Total Pages:** 15  
**Estimated Implementation:** 2 days (Week 11)  
**Expected Impact:** 50%+ adoption, $100/mo user savings
