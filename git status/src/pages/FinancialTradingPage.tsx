import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, Filter, Brain } from "lucide-react";
import { TradeForm } from "@/components/financial/TradeForm";
import { MarketDataTicker } from "@/components/financial/MarketDataTicker";
import { AIDecisionCard } from "@/components/financial/AIDecisionCard";
import type { SelectFinancialPortfolio, SelectFinancialTrade, SelectFinancialAIDecision } from "@shared/schema";

export default function FinancialTradingPage() {
  const [selectedPortfolio, setSelectedPortfolio] = useState<number | null>(null);

  const { data: portfolios, isLoading: portfoliosLoading } = useQuery<SelectFinancialPortfolio[]>({
    queryKey: ['/api/financial/portfolios'],
  });

  const { data: trades, isLoading: tradesLoading } = useQuery<SelectFinancialTrade[]>({
    queryKey: ['/api/financial/portfolios', selectedPortfolio, 'trades'],
    enabled: !!selectedPortfolio,
  });

  const { data: aiDecisions, isLoading: decisionsLoading } = useQuery<SelectFinancialAIDecision[]>({
    queryKey: ['/api/financial/portfolios', selectedPortfolio, 'ai-decisions'],
    enabled: !!selectedPortfolio,
  });

  const activePortfolio = portfolios?.find(p => p.id === selectedPortfolio);

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
            <TrendingUp className="h-6 w-6" style={{ color: '#40E0D0' }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Trading</h1>
            <p className="text-muted-foreground">Execute trades and monitor AI recommendations</p>
          </div>
        </div>
      </div>

      {/* Market Data Ticker */}
      <MarketDataTicker />

      {/* Portfolio Selector */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select
          value={selectedPortfolio?.toString() || ''}
          onValueChange={(value) => setSelectedPortfolio(parseInt(value))}
        >
          <SelectTrigger className="w-64" data-testid="select-portfolio">
            <SelectValue placeholder="Select a portfolio" />
          </SelectTrigger>
          <SelectContent>
            {portfoliosLoading ? (
              <SelectItem value="loading" disabled>Loading...</SelectItem>
            ) : portfolios && portfolios.length > 0 ? (
              portfolios.map((portfolio) => (
                <SelectItem key={portfolio.id} value={portfolio.id.toString()}>
                  {portfolio.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>No portfolios available</SelectItem>
            )}
          </SelectContent>
        </Select>
        {activePortfolio && (
          <div className="flex items-center gap-4 ml-4">
            <div>
              <p className="text-xs text-muted-foreground">Cash Available</p>
              <p className="text-lg font-bold" style={{ color: '#40E0D0' }}>
                ${parseFloat(activePortfolio.cashBalance || "0").toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Value</p>
              <p className="text-lg font-bold">
                ${parseFloat(activePortfolio.totalValue || "0").toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        )}
      </div>

      {!selectedPortfolio ? (
        <div 
          className="flex flex-col items-center justify-center h-96 rounded-lg"
          style={{
            background: 'rgba(64, 224, 208, 0.05)',
            border: '1px solid rgba(64, 224, 208, 0.1)',
          }}
        >
          <TrendingUp className="h-16 w-16 mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Select a Portfolio to Start Trading</p>
          <p className="text-muted-foreground text-center max-w-md">
            Choose a portfolio from the dropdown above to execute trades and view AI recommendations
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Trade Form (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {activePortfolio && (
              <TradeForm 
                portfolio={activePortfolio}
                onSuccess={() => {
                  // Refresh trades list
                }}
              />
            )}

            {/* Trade History */}
            <Card
              style={{
                background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.05) 0%, rgba(30, 144, 255, 0.05) 100%)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(64, 224, 208, 0.1)',
              }}
              data-testid="table-trade-history"
            >
              <CardHeader>
                <CardTitle>Trade History</CardTitle>
              </CardHeader>
              <CardContent>
                {tradesLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : trades && trades.length > 0 ? (
                  <div className="space-y-2">
                    {trades.slice(0, 10).map((trade) => (
                      <div 
                        key={trade.id}
                        className="flex items-center justify-between p-3 rounded-lg"
                        style={{
                          background: 'rgba(64, 224, 208, 0.03)',
                          border: '1px solid rgba(64, 224, 208, 0.1)',
                        }}
                        data-testid={`trade-row-${trade.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <Badge 
                            className={
                              trade.tradeType === 'buy' 
                                ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                                : 'bg-red-500/20 text-red-300 border-red-500/30'
                            }
                          >
                            {trade.tradeType.toUpperCase()}
                          </Badge>
                          <div>
                            <p className="font-medium">{trade.symbol}</p>
                            <p className="text-xs text-muted-foreground">
                              {parseFloat(trade.quantity).toFixed(4)} @ ${parseFloat(trade.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${parseFloat(trade.totalAmount).toFixed(2)}</p>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={
                                trade.status === 'executed' ? 'text-green-400 border-green-400/30' :
                                trade.status === 'pending' ? 'text-yellow-400 border-yellow-400/30' : 
                                'text-red-400 border-red-400/30'
                              }
                            >
                              {trade.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {new Date(trade.executedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No trades yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI Suggestions Sidebar (1 column) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" style={{ color: '#40E0D0' }} />
              <h2 className="text-xl font-semibold">AI Recommendations</h2>
            </div>

            {decisionsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : aiDecisions && aiDecisions.length > 0 ? (
              <div className="space-y-4" data-testid="panel-ai-suggestions">
                {aiDecisions.slice(0, 3).map((decision) => (
                  <AIDecisionCard
                    key={decision.id}
                    decision={decision}
                    onExecute={(id) => {
                      console.log('Execute decision:', id);
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
                <Brain className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">No AI recommendations yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
