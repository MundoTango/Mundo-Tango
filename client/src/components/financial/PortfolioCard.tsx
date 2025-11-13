import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, MoreVertical } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SelectFinancialPortfolio } from "@shared/schema";

interface PortfolioCardProps {
  portfolio: SelectFinancialPortfolio;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onClick?: (id: number) => void;
}

export function PortfolioCard({ portfolio, onEdit, onDelete, onClick }: PortfolioCardProps) {
  const totalValue = parseFloat(portfolio.totalValue || "0");
  const cashBalance = parseFloat(portfolio.cashBalance || "0");
  const investedValue = totalValue - cashBalance;
  
  // Mock 24h change calculation (in real app, would come from API)
  const change24h = totalValue * 0.023; // 2.3% mock gain
  const changePercent = (change24h / (totalValue || 1)) * 100;
  const isPositive = change24h >= 0;

  const typeColors: Record<string, string> = {
    personal: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    business: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    retirement: "bg-green-500/20 text-green-300 border-green-500/30",
  };

  return (
    <Card
      className="hover-elevate cursor-pointer transition-all duration-200"
      style={{
        background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.05) 0%, rgba(30, 144, 255, 0.05) 100%)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(64, 224, 208, 0.1)',
      }}
      onClick={() => onClick?.(portfolio.id)}
      data-testid={`card-portfolio-${portfolio.id}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{portfolio.name}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge className={typeColors[portfolio.type] || "bg-gray-500/20 text-gray-300"}>
            {portfolio.type}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                data-testid={`button-portfolio-menu-${portfolio.id}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onEdit?.(portfolio.id);
              }}>
                Edit Portfolio
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(portfolio.id);
                }}
              >
                Delete Portfolio
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Total Value</p>
          <p className="text-3xl font-bold" style={{ color: '#40E0D0' }} data-testid="text-portfolio-value">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-400" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-400" />
          )}
          <span className={isPositive ? "text-green-400" : "text-red-400"}>
            {isPositive ? '+' : ''}{changePercent.toFixed(2)}% (${Math.abs(change24h).toFixed(2)})
          </span>
          <span className="text-sm text-muted-foreground">24h</span>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
          <div>
            <p className="text-xs text-muted-foreground">Cash</p>
            <p className="text-sm font-medium">${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Invested</p>
            <p className="text-sm font-medium">${investedValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
