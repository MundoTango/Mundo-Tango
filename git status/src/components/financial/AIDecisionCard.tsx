import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, TrendingDown, RefreshCw, AlertTriangle } from "lucide-react";
import type { SelectFinancialAIDecision } from "@shared/schema";

interface AIDecisionCardProps {
  decision: SelectFinancialAIDecision;
  onExecute?: (decisionId: number) => void;
}

export function AIDecisionCard({ decision, onExecute }: AIDecisionCardProps) {
  const confidence = parseFloat(decision.confidence || "0");
  const confidencePercent = (confidence * 100).toFixed(0);
  
  const decisionTypeColors: Record<string, { bg: string; text: string; border: string; icon: any }> = {
    buy: { 
      bg: 'bg-green-500/20', 
      text: 'text-green-300', 
      border: 'border-green-500/30',
      icon: TrendingUp,
    },
    sell: { 
      bg: 'bg-red-500/20', 
      text: 'text-red-300', 
      border: 'border-red-500/30',
      icon: TrendingDown,
    },
    hold: { 
      bg: 'bg-yellow-500/20', 
      text: 'text-yellow-300', 
      border: 'border-yellow-500/30',
      icon: AlertTriangle,
    },
    rebalance: { 
      bg: 'bg-purple-500/20', 
      text: 'text-purple-300', 
      border: 'border-purple-500/30',
      icon: RefreshCw,
    },
  };

  const typeInfo = decisionTypeColors[decision.decisionType] || decisionTypeColors.hold;
  const Icon = typeInfo.icon;

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'text-green-400';
    if (conf >= 0.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card
      className="hover-elevate transition-all duration-200"
      style={{
        background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.05) 0%, rgba(30, 144, 255, 0.05) 100%)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(64, 224, 208, 0.1)',
      }}
      data-testid={`card-ai-decision-${decision.id}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg"
            style={{
              background: 'rgba(64, 224, 208, 0.1)',
              border: '1px solid rgba(64, 224, 208, 0.2)',
            }}
          >
            <Brain className="h-4 w-4" style={{ color: '#40E0D0' }} />
          </div>
          <div>
            <CardTitle className="text-base">Agent #{decision.agentId}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {new Date(decision.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <Badge className={`${typeInfo.bg} ${typeInfo.text} ${typeInfo.border}`}>
          <Icon className="h-3 w-3 mr-1" />
          {decision.decisionType.toUpperCase()}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {decision.symbol && (
          <div>
            <p className="text-sm text-muted-foreground">Symbol</p>
            <p className="text-xl font-bold" style={{ color: '#40E0D0' }}>
              {decision.symbol}
            </p>
          </div>
        )}

        <div>
          <p className="text-sm text-muted-foreground mb-1">AI Reasoning</p>
          <p className="text-sm leading-relaxed">{decision.reasoning}</p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div>
            <p className="text-xs text-muted-foreground">Confidence</p>
            <p className={`text-lg font-bold ${getConfidenceColor(confidence)}`}>
              {confidencePercent}%
            </p>
          </div>

          {decision.recommendation && typeof decision.recommendation === 'object' && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Suggested Action</p>
              <p className="text-sm font-medium">
                {(decision.recommendation as any).action || 'See details'}
              </p>
            </div>
          )}
        </div>

        {!decision.executedTradeId && onExecute && (
          <Button
            className="w-full"
            variant="outline"
            onClick={() => onExecute(decision.id)}
            data-testid={`button-execute-decision-${decision.id}`}
          >
            Execute Recommendation
          </Button>
        )}

        {decision.executedTradeId && (
          <Badge variant="outline" className="w-full justify-center">
            Executed (Trade #{decision.executedTradeId})
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
