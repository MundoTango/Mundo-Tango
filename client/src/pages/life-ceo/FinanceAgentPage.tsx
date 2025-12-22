import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { DollarSign, TrendingUp, TrendingDown, Wallet, CreditCard, PiggyBank, Target } from "lucide-react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import financeHeroImg from "@assets/stock_images/data_visualization_t_77d40658.jpg";
import financeImg1 from "@assets/stock_images/data_visualization_t_9dc4dcbd.jpg";

export default function FinanceAgentPage() {
  const { t } = useTranslation(["pages", "common"]);
  const summary = [
    { label: t('pages:lifeceo.finance.summary.totalBalance', 'Total Balance'), value: "$12,450", change: "+5.2%", icon: Wallet, color: "text-green-500" },
    { label: t('pages:lifeceo.finance.summary.monthlyIncome', 'Monthly Income'), value: "$5,200", change: "+2.1%", icon: TrendingUp, color: "text-blue-500" },
    { label: t('pages:lifeceo.finance.summary.monthlyExpenses', 'Monthly Expenses'), value: "$3,150", change: "-1.8%", icon: TrendingDown, color: "text-orange-500" },
    { label: t('pages:lifeceo.finance.summary.savingsGoal', 'Savings Goal'), value: "78%", change: "+12%", icon: PiggyBank, color: "text-purple-500" }
  ];

  const recentTransactions = [
    { name: t('pages:lifeceo.finance.transactions.groceryStore', 'Grocery Store'), amount: -85.50, category: t('pages:lifeceo.finance.category.food', 'Food'), date: t('pages:lifeceo.finance.date.today', 'Today') },
    { name: t('pages:lifeceo.finance.transactions.salaryDeposit', 'Salary Deposit'), amount: 5200.00, category: t('pages:lifeceo.finance.category.income', 'Income'), date: t('pages:lifeceo.finance.date.yesterday', 'Yesterday') },
    { name: t('pages:lifeceo.finance.transactions.electricBill', 'Electric Bill'), amount: -120.00, category: t('pages:lifeceo.finance.category.utilities', 'Utilities'), date: t('pages:lifeceo.finance.date.2daysAgo', '2 days ago') },
    { name: "Netflix", amount: -15.99, category: t('pages:lifeceo.finance.category.entertainment', 'Entertainment'), date: t('pages:lifeceo.finance.date.3daysAgo', '3 days ago') }
  ];

  return (
    <SelfHealingErrorBoundary pageName="Finance Agent" fallbackRoute="/life-ceo">
      <PageLayout title={t('pages:lifeceo.finance.title', 'Finance Agent')} showBreadcrumbs>
        <>
          <SEO
            title={t('pages:lifeceo.finance.seoTitle', 'Finance Agent - Life CEO')}
            description={t('pages:lifeceo.finance.seoDescription', 'Manage your budget, track expenses, and achieve financial goals with your AI finance agent.')}
          />

          {/* Editorial Hero Section - 16:9 */}
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden" data-testid="hero-section">
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${financeHeroImg})`}}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                  {t('pages:lifeceo.finance.badge', 'Wealth Management')}
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 tracking-tight" data-testid="heading-hero">
                  {t('pages:lifeceo.finance.heroTitle', 'Finance Agent')}
                </h1>
                
                <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                  {t('pages:lifeceo.finance.heroSubtitle', 'Your personal financial advisor for budgeting and wealth building')}
                </p>
              </motion.div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-16">
            {/* Summary Cards */}
            <div className="grid gap-8 md:grid-cols-4 mb-16">
              {summary.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <Card className="hover-elevate">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <item.icon className={`h-8 w-8 ${item.color}`} />
                        <span className="text-xs text-green-500 font-medium">{item.change}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="text-3xl font-serif font-bold mt-2">{item.value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">{t('pages:lifeceo.finance.sectionTitle', 'Financial Overview')}</h2>
              <p className="text-lg text-muted-foreground">
                {t('pages:lifeceo.finance.sectionSubtitle', 'Track transactions and manage your budget with AI insights')}
              </p>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Recent Transactions Card with 16:9 Image */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <Card className="overflow-hidden hover-elevate">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <motion.img
                      src={financeImg1}
                      alt={t('pages:lifeceo.finance.recentTransactionsAlt', 'Recent Transactions')}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-2xl font-serif font-bold">{t('pages:lifeceo.finance.recentTransactions', 'Recent Transactions')}</h3>
                      <p className="text-white/80 text-sm mt-1">{t('pages:lifeceo.finance.recentTransactionsSubtitle', 'Your latest financial activity')}</p>
                    </div>
                  </div>
                  <CardContent className="p-8 space-y-3">
                    {recentTransactions.map((tx, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover-elevate" data-testid={`transaction-${idx}`}>
                        <div className="flex-1">
                          <p className="font-medium">{tx.name}</p>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline">{tx.category}</Badge>
                            <span>•</span>
                            <span>{tx.date}</span>
                          </div>
                        </div>
                        <p className={`font-bold text-lg ${tx.amount > 0 ? "text-green-500" : "text-muted-foreground"}`}>
                          {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                        </p>
                      </div>
                    ))}
                    <Button className="w-full gap-2" variant="outline" data-testid="button-add-transaction">
                      <CreditCard className="w-4 h-4" />
                      {t('pages:lifeceo.finance.addTransaction', 'Add Transaction')}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Budget Goals */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="glass-card h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl font-serif">
                      <Target className="h-6 w-6 text-purple-500" />
                      {t('pages:lifeceo.finance.budgetGoals', 'Budget Goals')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{t('pages:lifeceo.finance.budget.foodDining', 'Food & Dining')}</span>
                        <span className="text-sm text-muted-foreground">$420 / $500</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: "84%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{t('pages:lifeceo.finance.budget.transportation', 'Transportation')}</span>
                        <span className="text-sm text-muted-foreground">$180 / $300</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: "60%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{t('pages:lifeceo.finance.budget.entertainment', 'Entertainment')}</span>
                        <span className="text-sm text-muted-foreground">$250 / $200</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: "100%" }} />
                      </div>
                      <p className="text-xs text-red-500 mt-1">{t('pages:lifeceo.finance.overBudget', '⚠️ Over budget by $50')}</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{t('pages:lifeceo.finance.budget.savings', 'Savings')}</span>
                        <span className="text-sm text-muted-foreground">$1,550 / $2,000</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: "78%" }} />
                      </div>
                    </div>

                    <Button className="w-full gap-2" data-testid="button-set-budget">
                      <DollarSign className="w-4 h-4" />
                      {t('pages:lifeceo.finance.setMonthlyBudget', 'Set Monthly Budget')}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
