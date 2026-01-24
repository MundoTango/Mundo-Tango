import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LayoutDashboard, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  PieChart,
  ArrowUpRight,
} from "lucide-react";
import { PortfolioCard } from "@/components/financial/PortfolioCard";
import { AssetAllocationChart } from "@/components/financial/AssetAllocationChart";
import { MarketDataTicker } from "@/components/financial/MarketDataTicker";
import { useLocation } from "wouter";
import type { SelectFinancialPortfolio, SelectFinancialAsset, SelectFinancialTrade } from "@shared/client-types";

export default function FinancialDashboardPage() {
  const { t } = useTranslation(["pages", "common"]);
  const [, navigate] = useLocation();

  const { data: portfolios, isLoading: portfoliosLoading } = useQuery<SelectFinancialPortfolio[]>({
    queryKey: ['/api/financial/portfolios'],
  });

  const { data: allAssets, isLoading: assetsLoading } = useQuery<SelectFinancialAsset[]>({
    queryKey: ['/api/financial/assets'],
    enabled: !!portfolios && portfolios.length > 0,
  });

  const { data: recentTrades, isLoading: tradesLoading } = useQuery<SelectFinancialTrade[]>({
    queryKey: ['/api/financial/trades/recent'],
    enabled: !!portfolios && portfolios.length > 0,
  });

  const totalValue = portfolios?.reduce((sum, p) => sum + parseFloat(p.totalValue || "0"), 0) || 0;
  const totalCash = portfolios?.reduce((sum, p) => sum + parseFloat(p.cashBalance || "0"), 0) || 0;
  const totalInvested = totalValue - totalCash;

  // Mock 24h change (in real app, would be calculated from historical data)
  const change24h = totalValue * 0.023;
  const changePercent = ((change24h / (totalValue || 1)) * 100).toFixed(2);
  const isPositive = change24h >= 0;

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
            <LayoutDashboard className="h-6 w-6" style={{ color: '#40E0D0' }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t('pages:financialDashboard.title', 'Financial Dashboard')}</h1>
            <p className="text-muted-foreground">{t('pages:financialDashboard.subtitle', 'Monitor your portfolios and investments')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate('/financial/accounts')}
            data-testid="button-add-account"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('pages:financialDashboard.addAccount', 'Add Account')}
          </Button>
          <Button 
            onClick={() => navigate('/financial/trading')}
            data-testid="button-make-trade"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            {t('pages:financialDashboard.makeTrade', 'Make Trade')}
          </Button>
        </div>
      </div>

      {/* Market Data Ticker */}
      <MarketDataTicker />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card
          style={{
            background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.1) 0%, rgba(30, 144, 255, 0.1) 100%)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(64, 224, 208, 0.2)',
          }}
          data-testid="card-total-value"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('pages:financialDashboard.totalPortfolioValue', 'Total Portfolio Value')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {portfoliosLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold" style={{ color: '#40E0D0' }} data-testid="text-total-value">
                  ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className={`h-3 w-3 ${isPositive ? 'text-green-400' : 'text-red-400'}`} />
                  <p className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{changePercent}% {t('pages:financialDashboard.fromYesterday', 'from yesterday')}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card
          style={{
            background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.05) 0%, rgba(30, 144, 255, 0.05) 100%)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(64, 224, 208, 0.1)',
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('pages:financialDashboard.cashBalance', 'Cash Balance')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {portfoliosLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">
                ${totalCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {t('pages:financialDashboard.availableForTrading', 'Available for trading')}
            </p>
          </CardContent>
        </Card>

        <Card
          style={{
            background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.05) 0%, rgba(30, 144, 255, 0.05) 100%)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(64, 224, 208, 0.1)',
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('pages:financialDashboard.investedValue', 'Invested Value')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {portfoliosLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">
                ${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {t('pages:financialDashboard.currentlyInPositions', 'Currently in positions')}
            </p>
          </CardContent>
        </Card>

        <Card
          style={{
            background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.05) 0%, rgba(30, 144, 255, 0.05) 100%)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(64, 224, 208, 0.1)',
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('pages:financialDashboard.activePortfolios', 'Active Portfolios')}</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {portfoliosLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold">{portfolios?.length || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {t('pages:financialDashboard.portfolioAccounts', 'Portfolio accounts')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Cards and Asset Allocation */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Portfolios */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('pages:financialDashboard.yourPortfolios', 'Your Portfolios')}</h2>
            <Button 
              size="sm"
              variant="outline"
              onClick={() => navigate('/financial/portfolios')}
            >
              {t('common:viewAll', 'View All')}
            </Button>
          </div>
          {portfoliosLoading ? (
            <>
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </>
          ) : portfolios && portfolios.length > 0 ? (
            portfolios.slice(0, 2).map((portfolio) => (
              <PortfolioCard
                key={portfolio.id}
                portfolio={portfolio}
                onClick={(id) => navigate(`/financial/portfolios/${id}`)}
              />
            ))
          ) : (
            <Card
              className="flex flex-col items-center justify-center h-48"
              style={{
                background: 'rgba(64, 224, 208, 0.05)',
                border: '1px solid rgba(64, 224, 208, 0.1)',
              }}
            >
              <p className="text-muted-foreground mb-4">{t('pages:financialDashboard.noPortfolios', 'No portfolios yet')}</p>
              <Button 
                onClick={() => navigate('/financial/portfolios')}
                data-testid="button-create-portfolio"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('pages:financialDashboard.createPortfolio', 'Create Portfolio')}
              </Button>
            </Card>
          )}
        </div>

        {/* Asset Allocation */}
        <AssetAllocationChart assets={allAssets || []} />
      </div>

      {/* Recent Trades */}
      <Card
        style={{
          background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.05) 0%, rgba(30, 144, 255, 0.05) 100%)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(64, 224, 208, 0.1)',
        }}
        data-testid="table-trades"
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('pages:financialDashboard.recentTrades', 'Recent Trades')}</CardTitle>
            <Button 
              size="sm"
              variant="outline"
              onClick={() => navigate('/financial/trading')}
            >
              {t('common:viewAll', 'View All')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tradesLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : recentTrades && recentTrades.length > 0 ? (
            <div className="space-y-2">
              {recentTrades.slice(0, 5).map((trade) => (
                <div 
                  key={trade.id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{
                    background: 'rgba(64, 224, 208, 0.03)',
                    border: '1px solid rgba(64, 224, 208, 0.1)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        trade.tradeType === 'buy' 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {trade.tradeType.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{trade.symbol}</p>
                      <p className="text-xs text-muted-foreground">
                        {parseFloat(trade.quantity).toFixed(4)} @ ${parseFloat(trade.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${parseFloat(trade.totalAmount).toFixed(2)}</p>
                    <p className={`text-xs ${
                      trade.status === 'executed' ? 'text-green-400' :
                      trade.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {trade.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">{t('pages:financialDashboard.noTrades', 'No trades yet')}</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2"
          onClick={() => navigate('/financial/insights')}
        >
          <TrendingUp className="h-6 w-6" style={{ color: '#40E0D0' }} />
          <span>{t('pages:financialDashboard.viewAiInsights', 'View AI Insights')}</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2"
          onClick={() => navigate('/financial/portfolios')}
        >
          <PieChart className="h-6 w-6" style={{ color: '#40E0D0' }} />
          <span>{t('pages:financialDashboard.managePortfolios', 'Manage Portfolios')}</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2"
          onClick={() => navigate('/financial/accounts')}
        >
          <Plus className="h-6 w-6" style={{ color: '#40E0D0' }} />
          <span>{t('pages:financialDashboard.connectAccounts', 'Connect Accounts')}</span>
        </Button>
      </div>
    </div>
  );
}
