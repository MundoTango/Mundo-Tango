import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface DonationTierCardProps {
  tier: {
    id: number;
    amount: number;
    title: string;
    description: string;
    backerCount?: number;
    limitedQuantity?: number;
    remaining?: number;
  };
  onSelect: (tierId: number) => void;
  isSelected?: boolean;
  className?: string;
}

export function DonationTierCard({ tier, onSelect, isSelected, className }: DonationTierCardProps) {
  const isSoldOut = tier.limitedQuantity && tier.remaining !== undefined && tier.remaining <= 0;

  return (
    <Card 
      className={cn(
        "group border-white/10 transition-all duration-300",
        isSelected && "border-primary ring-2 ring-primary/50",
        !isSoldOut && "hover-elevate cursor-pointer",
        isSoldOut && "opacity-50",
        className
      )}
      style={{
        background: 'linear-gradient(135deg, rgba(10, 24, 40, 0.6) 0%, rgba(30, 144, 255, 0.1) 100%)',
        backdropFilter: 'blur(12px)',
      }}
      onClick={() => !isSoldOut && onSelect(tier.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold" style={{
              background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              ${tier.amount}
            </CardTitle>
            <h4 className="text-lg font-semibold text-foreground">{tier.title}</h4>
          </div>
          
          {isSelected && (
            <Badge variant="default" className="bg-primary">
              <Check className="w-3 h-3 mr-1" />
              Selected
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {tier.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {tier.backerCount !== undefined && (
            <span>{tier.backerCount} backers</span>
          )}
          {tier.limitedQuantity && tier.remaining !== undefined && (
            <Badge variant="outline" className={cn(
              tier.remaining === 0 ? "border-red-500/30 text-red-300" : "border-primary/30 text-primary"
            )}>
              {tier.remaining > 0 ? `${tier.remaining} left` : 'Sold out'}
            </Badge>
          )}
        </div>

        <Button 
          className="w-full"
          variant={isSelected ? "default" : "outline"}
          disabled={isSoldOut}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(tier.id);
          }}
          data-testid={`button-select-tier-${tier.id}`}
        >
          {isSoldOut ? 'Sold Out' : isSelected ? 'Selected' : 'Select Tier'}
        </Button>
      </CardContent>
    </Card>
  );
}
