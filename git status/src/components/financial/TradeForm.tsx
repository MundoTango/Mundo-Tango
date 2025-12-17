import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { SelectFinancialPortfolio } from "@shared/schema";

const tradeFormSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").max(50),
  tradeType: z.enum(['buy', 'sell']),
  quantity: z.string().regex(/^\d+(\.\d{1,8})?$/, "Invalid quantity"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price"),
});

type TradeFormData = z.infer<typeof tradeFormSchema>;

interface TradeFormProps {
  portfolio: SelectFinancialPortfolio;
  onSuccess?: () => void;
}

export function TradeForm({ portfolio, onSuccess }: TradeFormProps) {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<TradeFormData>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues: {
      tradeType: 'buy',
      quantity: '',
      price: '',
      symbol: '',
    },
  });

  const quantity = watch('quantity');
  const price = watch('price');
  const symbol = watch('symbol');

  const totalAmount = quantity && price 
    ? (parseFloat(quantity) * parseFloat(price)).toFixed(2)
    : '0.00';
  
  const fees = parseFloat(totalAmount) * 0.001; // 0.1% fee
  const cashBalance = parseFloat(portfolio.cashBalance || "0");
  const hasSufficientFunds = tradeType === 'buy' 
    ? cashBalance >= (parseFloat(totalAmount) + fees)
    : true;

  const executeTrade = useMutation({
    mutationFn: async (data: TradeFormData) => {
      const response = await apiRequest(`/api/financial/portfolios/${portfolio.id}/trades`, {
        method: 'POST',
        body: JSON.stringify({
          portfolioId: portfolio.id,
          symbol: data.symbol.toUpperCase(),
          tradeType: data.tradeType,
          quantity: data.quantity,
          price: data.price,
          totalAmount: totalAmount,
          fees: fees.toFixed(2),
          status: 'pending',
          executedAt: new Date().toISOString(),
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/financial/portfolios'] });
      queryClient.invalidateQueries({ queryKey: ['/api/financial/portfolios', portfolio.id, 'trades'] });
      toast({
        title: "Trade Submitted",
        description: `${tradeType.toUpperCase()} order for ${symbol} submitted successfully`,
      });
      reset();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Trade Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TradeFormData) => {
    if (!hasSufficientFunds) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough cash balance for this trade",
        variant: "destructive",
      });
      return;
    }
    executeTrade.mutate(data);
  };

  return (
    <Card
      style={{
        background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.05) 0%, rgba(30, 144, 255, 0.05) 100%)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(64, 224, 208, 0.1)',
      }}
      data-testid="form-trade"
    >
      <CardHeader>
        <CardTitle>Execute Trade</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={tradeType === 'buy' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setTradeType('buy')}
              data-testid="button-trade-buy"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Buy
            </Button>
            <Button
              type="button"
              variant={tradeType === 'sell' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setTradeType('sell')}
              data-testid="button-trade-sell"
            >
              <TrendingDown className="h-4 w-4 mr-2" />
              Sell
            </Button>
          </div>

          <div>
            <Label htmlFor="symbol">Symbol</Label>
            <Input
              id="symbol"
              {...register('symbol')}
              placeholder="BTC, ETH, AAPL, etc."
              className="uppercase"
              data-testid="input-trade-symbol"
            />
            {errors.symbol && (
              <p className="text-sm text-red-400 mt-1">{errors.symbol.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                {...register('quantity')}
                type="number"
                step="any"
                placeholder="0.00"
                data-testid="input-trade-quantity"
              />
              {errors.quantity && (
                <p className="text-sm text-red-400 mt-1">{errors.quantity.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                {...register('price')}
                type="number"
                step="0.01"
                placeholder="0.00"
                data-testid="input-trade-price"
              />
              {errors.price && (
                <p className="text-sm text-red-400 mt-1">{errors.price.message}</p>
              )}
            </div>
          </div>

          <input type="hidden" {...register('tradeType')} value={tradeType} />

          <div 
            className="p-4 rounded-lg space-y-2"
            style={{
              background: 'rgba(64, 224, 208, 0.05)',
              border: '1px solid rgba(64, 224, 208, 0.2)',
            }}
          >
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">${totalAmount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fees (0.1%)</span>
              <span className="font-medium">${fees.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold border-t border-white/10 pt-2">
              <span>Final Amount</span>
              <span style={{ color: '#40E0D0' }}>
                ${(parseFloat(totalAmount) + fees).toFixed(2)}
              </span>
            </div>
          </div>

          {!hasSufficientFunds && tradeType === 'buy' && (
            <div className="flex items-center gap-2 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span>Insufficient funds. Available: ${cashBalance.toFixed(2)}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={executeTrade.isPending || !hasSufficientFunds}
            data-testid="button-execute-trade"
          >
            {executeTrade.isPending ? 'Executing...' : `Execute ${tradeType.toUpperCase()} Order`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
