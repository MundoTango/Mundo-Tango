import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { DollarSign, TrendingUp, TrendingDown, Wallet, CreditCard, PiggyBank, Target } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";

export default function FinanceAgentPage() {
  const summary = [
    { label: "Total Balance", value: "$12,450", change: "+5.2%", icon: Wallet, color: "text-green-500" },
    { label: "Monthly Income", value: "$5,200", change: "+2.1%", icon: TrendingUp, color: "text-blue-500" },
    { label: "Monthly Expenses", value: "$3,150", change: "-1.8%", icon: TrendingDown, color: "text-orange-500" },
    { label: "Savings Goal", value: "78%", change: "+12%", icon: PiggyBank, color: "text-purple-500" }
  ];

  const recentTransactions = [
    { name: "Grocery Store", amount: -85.50, category: "Food", date: "Today" },
    { name: "Salary Deposit", amount: 5200.00, category: "Income", date: "Yesterday" },
    { name: "Electric Bill", amount: -120.00, category: "Utilities", date: "2 days ago" },
    { name: "Netflix", amount: -15.99, category: "Entertainment", date: "3 days ago" }
  ];

  return (
    <PageLayout title="Finance Agent" showBreadcrumbs>
      <SEO
        title="Finance Agent - Life CEO"
        description="Manage your budget, track expenses, and achieve financial goals with your AI finance agent."
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Finance Agent</h1>
                <p className="text-muted-foreground">Your personal financial advisor</p>
              </div>
            </div>
          </motion.div>

          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            {summary.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <item.icon className={`h-8 w-8 ${item.color}`} />
                      <span className="text-xs text-green-500 font-medium">{item.change}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-2xl font-bold">{item.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Transactions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentTransactions.map((tx, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover-elevate">
                    <div className="flex-1">
                      <p className="font-medium">{tx.name}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>{tx.category}</span>
                        <span>•</span>
                        <span>{tx.date}</span>
                      </div>
                    </div>
                    <p className={`font-bold ${tx.amount > 0 ? "text-green-500" : "text-muted-foreground"}`}>
                      {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                    </p>
                  </div>
                ))}
                <Button className="w-full" variant="outline" data-testid="button-add-transaction">
                  + Add Transaction
                </Button>
              </CardContent>
            </Card>

            {/* Budget Goals */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  Budget Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Food & Dining</span>
                    <span className="text-sm text-muted-foreground">$420 / $500</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: "84%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Transportation</span>
                    <span className="text-sm text-muted-foreground">$180 / $300</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: "60%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Entertainment</span>
                    <span className="text-sm text-muted-foreground">$250 / $200</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: "100%" }} />
                  </div>
                  <p className="text-xs text-red-500 mt-1">⚠️ Over budget by $50</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Savings</span>
                    <span className="text-sm text-muted-foreground">$1,550 / $2,000</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: "78%" }} />
                  </div>
                </div>

                <Button className="w-full" data-testid="button-set-budget">
                  Set Monthly Budget
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
