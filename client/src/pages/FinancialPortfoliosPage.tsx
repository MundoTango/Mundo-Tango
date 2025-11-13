import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Briefcase, Plus, Filter } from "lucide-react";
import { PortfolioCard } from "@/components/financial/PortfolioCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "wouter";
import type { SelectFinancialPortfolio } from "@shared/schema";

const portfolioFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  type: z.enum(['personal', 'business', 'retirement']),
  cashBalance: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
});

type PortfolioFormData = z.infer<typeof portfolioFormSchema>;

export default function FinancialPortfoliosPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: portfolios, isLoading } = useQuery<SelectFinancialPortfolio[]>({
    queryKey: ['/api/financial/portfolios'],
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioFormSchema),
    defaultValues: {
      type: 'personal',
      cashBalance: '0',
    },
  });

  const createPortfolio = useMutation({
    mutationFn: async (data: PortfolioFormData) => {
      const response = await apiRequest('/api/financial/portfolios', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          type: data.type,
          totalValue: data.cashBalance || '0',
          cashBalance: data.cashBalance || '0',
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/financial/portfolios'] });
      toast({
        title: "Portfolio Created",
        description: "Your new portfolio has been created successfully",
      });
      reset();
      setCreateOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePortfolio = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/financial/portfolios/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/financial/portfolios'] });
      toast({
        title: "Portfolio Deleted",
        description: "Portfolio has been removed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PortfolioFormData) => {
    createPortfolio.mutate(data);
  };

  const filteredPortfolios = portfolios?.filter(p => 
    filterType === 'all' || p.type === filterType
  ) || [];

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="p-3 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.2) 0%, rgba(30, 144, 255, 0.2) 100%)',
              border: '1px solid rgba(64, 224, 208, 0.3)',
            }}
          >
            <Briefcase className="h-6 w-6" style={{ color: '#40E0D0' }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Portfolios</h1>
            <p className="text-muted-foreground">Manage your investment portfolios</p>
          </div>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-portfolio">
              <Plus className="h-4 w-4 mr-2" />
              Create Portfolio
            </Button>
          </DialogTrigger>
          <DialogContent
            style={{
              background: 'linear-gradient(135deg, rgba(10, 24, 40, 0.98) 0%, rgba(30, 144, 255, 0.15) 100%)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(64, 224, 208, 0.2)',
            }}
          >
            <DialogHeader>
              <DialogTitle>Create New Portfolio</DialogTitle>
              <DialogDescription>
                Set up a new investment portfolio to organize your assets
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Portfolio Name</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="My Investment Portfolio"
                  data-testid="input-portfolio-name"
                />
                {errors.name && (
                  <p className="text-sm text-red-400 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <Select onValueChange={(value) => setValue('type', value as any)}>
                  <SelectTrigger id="type" data-testid="select-portfolio-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="retirement">Retirement</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-400 mt-1">{errors.type.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cashBalance">Initial Cash Balance</Label>
                <Input
                  id="cashBalance"
                  {...register('cashBalance')}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  data-testid="input-cash-balance"
                />
                {errors.cashBalance && (
                  <p className="text-sm text-red-400 mt-1">{errors.cashBalance.message}</p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createPortfolio.isPending}
                  data-testid="button-submit-portfolio"
                >
                  {createPortfolio.isPending ? 'Creating...' : 'Create Portfolio'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="retirement">Retirement</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Portfolio Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : filteredPortfolios.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPortfolios.map((portfolio) => (
            <PortfolioCard
              key={portfolio.id}
              portfolio={portfolio}
              onClick={(id) => navigate(`/financial/portfolios/${id}`)}
              onDelete={(id) => {
                if (confirm('Are you sure you want to delete this portfolio?')) {
                  deletePortfolio.mutate(id);
                }
              }}
            />
          ))}
        </div>
      ) : (
        <div 
          className="flex flex-col items-center justify-center h-64 rounded-lg"
          style={{
            background: 'rgba(64, 224, 208, 0.05)',
            border: '1px solid rgba(64, 224, 208, 0.1)',
          }}
        >
          <Briefcase className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-muted-foreground mb-4">
            {filterType === 'all' ? 'No portfolios yet' : `No ${filterType} portfolios`}
          </p>
          <Button onClick={() => setCreateOpen(true)} data-testid="button-create-first-portfolio">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Portfolio
          </Button>
        </div>
      )}
    </div>
  );
}
