import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const POPULAR_SYMBOLS = ['BTC', 'ETH', 'SPY', 'TSLA'];

interface MarketTickerItemProps {
  symbol: string;
}

function MarketTickerItem({ symbol }: MarketTickerItemProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/financial/market', symbol],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div 
        className="flex items-center gap-3 px-4 py-2 rounded-lg"
        style={{
          background: 'rgba(64, 224, 208, 0.05)',
          border: '1px solid rgba(64, 224, 208, 0.1)',
        }}
      >
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    );
  }

  if (!data) {
    return (
      <div 
        className="flex items-center gap-3 px-4 py-2 rounded-lg opacity-50"
        style={{
          background: 'rgba(64, 224, 208, 0.05)',
          border: '1px solid rgba(64, 224, 208, 0.1)',
        }}
      >
        <span className="text-sm font-medium">{symbol}</span>
        <span className="text-xs text-muted-foreground">No data</span>
      </div>
    );
  }

  const price = parseFloat(data.price || "0");
  const change24h = parseFloat(data.change24h || "0");
  const isPositive = change24h >= 0;

  return (
    <div 
      className="flex items-center gap-3 px-4 py-2 rounded-lg hover-elevate cursor-pointer transition-all"
      style={{
        background: 'rgba(64, 224, 208, 0.05)',
        border: '1px solid rgba(64, 224, 208, 0.1)',
      }}
      data-testid={`ticker-item-${symbol}`}
    >
      <span className="text-sm font-bold" style={{ color: '#40E0D0' }}>{symbol}</span>
      <span className="text-sm font-medium">${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      <div className="flex items-center gap-1">
        {isPositive ? (
          <TrendingUp className="h-3 w-3 text-green-400" />
        ) : (
          <TrendingDown className="h-3 w-3 text-red-400" />
        )}
        <span className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{change24h.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

export function MarketDataTicker() {
  return (
    <div 
      className="p-4 rounded-lg"
      style={{
        background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.05) 0%, rgba(30, 144, 255, 0.05) 100%)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(64, 224, 208, 0.1)',
      }}
      data-testid="ticker-market-data"
    >
      <div className="flex items-center gap-2 mb-3">
        <Activity className="h-4 w-4" style={{ color: '#40E0D0' }} />
        <h3 className="text-sm font-semibold">Live Market Data</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {POPULAR_SYMBOLS.map((symbol) => (
          <MarketTickerItem key={symbol} symbol={symbol} />
        ))}
      </div>
    </div>
  );
}
