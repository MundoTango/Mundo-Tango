import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ExpenseItem } from "@/components/travel/ExpenseItem";
import { BudgetCalculator } from "@/components/travel/BudgetCalculator";
import { Plus, Download, ArrowLeft, DollarSign, TrendingUp, Users } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const expenseSchema = z.object({
  description: z.string().min(1, "pages:travel.expenses.validation.description_required"),
  amount: z.number().min(0.01, "pages:travel.expenses.validation.amount_positive"),
  category: z.string().min(1, "pages:travel.expenses.validation.category_required"),
  date: z.string().optional(),
});

type ExpenseForm = z.infer<typeof expenseSchema>;

export default function TravelExpensesPage() {
  const { t } = useTranslation(["pages", "common"]);
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showAddExpense, setShowAddExpense] = useState(false);

  const { data: trip, isLoading: tripLoading } = useQuery({
    queryKey: ["/api/travel/plans", id],
    enabled: !!id,
  });

  // Mock expenses data (would come from API in production)
  const expenses = [
    {
      id: 1,
      description: t('pages:travel.expenses.mock.hotel', 'Hotel Booking - 5 nights'),
      amount: 500,
      currency: "USD",
      category: "accommodation",
      date: "2024-03-15",
      payer: { id: 1, name: t('pages:travel.expenses.you', 'You'), profileImage: undefined },
      splitType: "equal" as const,
      participants: 2,
    },
    {
      id: 2,
      description: t('pages:travel.expenses.mock.flight', 'Flight Tickets'),
      amount: 350,
      currency: "USD",
      category: "transport",
      date: "2024-03-14",
      payer: { id: 1, name: t('pages:travel.expenses.you', 'You'), profileImage: undefined },
      splitType: "equal" as const,
      participants: 2,
    },
    {
      id: 3,
      description: t('pages:travel.expenses.mock.dinner', 'Dinner at La Cabrera'),
      amount: 80,
      currency: "USD",
      category: "food",
      date: "2024-03-16",
      payer: { id: 1, name: t('pages:travel.expenses.you', 'You'), profileImage: undefined },
      splitType: "equal" as const,
      participants: 2,
    },
  ];

  const form = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: 0,
      category: "",
      date: new Date().toISOString().split('T')[0],
    },
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (data: ExpenseForm) => {
      // Would call API in production
      return data;
    },
    onSuccess: () => {
      toast({
        title: t('pages:travel.expenses.toast.added_title', 'Expense added'),
        description: t('pages:travel.expenses.toast.added_desc', 'Your expense has been added successfully.'),
      });
      setShowAddExpense(false);
      form.reset();
    },
  });

  const onSubmit = (data: ExpenseForm) => {
    addExpenseMutation.mutate(data);
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const budgetData = expenses.map(exp => ({
    category: exp.category,
    amount: exp.amount,
  }));

  // Calculate balances (who owes whom)
  const balances = [
    { userId: 1, userName: t('pages:travel.expenses.you', 'You'), amount: 0 },
    { userId: 2, userName: t('pages:travel.expenses.travel_partner', 'Travel Partner'), amount: totalExpenses / 2 },
  ];

  if (tripLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Skeleton className="h-12 w-1/3 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${trip?.city || t('pages:travel.expenses.seo_title_fallback', 'Trip')} - ${t('pages:travel.expenses.seo_title_suffix', 'Expenses')}`}
        description={t('pages:travel.expenses.seo_description', 'Track and split travel expenses with your group')}
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link href={`/travel/trip/${id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('pages:travel.expenses.back_to_trip', 'Back to Trip')}
              </Link>
            </Button>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-4xl font-serif font-bold mb-2">{t('pages:travel.expenses.title', 'Trip Expenses')}</h1>
                <p className="text-muted-foreground">{trip?.city || t('pages:travel.expenses.subtitle', 'Manage your trip expenses')}</p>
              </div>

              <div className="flex gap-2">
                <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-expense">
                      <Plus className="h-4 w-4 mr-2" />
                      {t('pages:travel.expenses.add_expense', 'Add Expense')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('pages:travel.expenses.add_new_title', 'Add New Expense')}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('pages:travel.expenses.form.description', 'Description')}</FormLabel>
                              <FormControl>
                                <Input placeholder={t('pages:travel.expenses.form.description_placeholder', 'Hotel booking')} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('pages:travel.expenses.form.amount', 'Amount (USD)')}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="100.00"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('pages:travel.expenses.form.category', 'Category')}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={t('pages:travel.expenses.form.category_placeholder', 'Select category')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="accommodation">{t('pages:travel.expenses.categories.accommodation', 'Accommodation')}</SelectItem>
                                  <SelectItem value="transport">{t('pages:travel.expenses.categories.transport', 'Transport')}</SelectItem>
                                  <SelectItem value="food">{t('pages:travel.expenses.categories.food', 'Food & Dining')}</SelectItem>
                                  <SelectItem value="activities">{t('pages:travel.expenses.categories.activities', 'Activities')}</SelectItem>
                                  <SelectItem value="events">{t('pages:travel.expenses.categories.events', 'Events')}</SelectItem>
                                  <SelectItem value="other">{t('pages:travel.expenses.categories.other', 'Other')}</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('pages:travel.expenses.form.date', 'Date')}</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowAddExpense(false)}
                            className="flex-1"
                          >
                            {t('pages:travel.expenses.form.cancel', 'Cancel')}
                          </Button>
                          <Button
                            type="submit"
                            className="flex-1"
                            disabled={addExpenseMutation.isPending}
                          >
                            {addExpenseMutation.isPending 
                              ? t('pages:travel.expenses.form.adding', 'Adding...') 
                              : t('pages:travel.expenses.add_expense', 'Add Expense')}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  {t('pages:travel.expenses.export_csv', 'Export CSV')}
                </Button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('pages:travel.expenses.summary.total', 'Total Expenses')}</p>
                    <p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-secondary/10">
                    <Users className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('pages:travel.expenses.summary.per_person', 'Per Person')}</p>
                    <p className="text-2xl font-bold">${(totalExpenses / 2).toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-accent/10">
                    <TrendingUp className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('pages:travel.expenses.summary.transactions', 'Transactions')}</p>
                    <p className="text-2xl font-bold">{expenses.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Expenses List */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('pages:travel.expenses.list_title', 'All Expenses')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {expenses.map((expense) => (
                    <ExpenseItem key={expense.id} expense={expense} />
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <BudgetCalculator
                totalBudget={trip?.budget || 1000}
                expenses={budgetData}
                participants={2}
                currency="USD"
              />

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('pages:travel.expenses.balance.title', 'Balance Summary')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3" data-testid="text-balance-summary">
                  {balances.map((balance) => (
                    <div
                      key={balance.userId}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <span className="font-medium">{balance.userName}</span>
                      <Badge
                        variant={balance.amount === 0 ? "outline" : "default"}
                        className={balance.amount > 0 ? "bg-green-500" : ""}
                      >
                        {balance.amount === 0
                          ? t('pages:travel.expenses.balance.settled', 'Settled')
                          : `${t('pages:travel.expenses.balance.owes', 'Owes')} $${Math.abs(balance.amount).toFixed(2)}`}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
