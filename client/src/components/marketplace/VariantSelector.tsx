import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ProductVariant {
  name: string;
  options: string[];
}

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariants: Record<string, string>;
  onChange: (variantName: string, value: string) => void;
}

export function VariantSelector({
  variants,
  selectedVariants,
  onChange,
}: VariantSelectorProps) {
  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4" data-testid="variant-selector">
      {variants.map((variant) => (
        <div key={variant.name} className="space-y-2">
          <Label className="text-sm font-medium">
            {variant.name}
            {selectedVariants[variant.name] && (
              <span className="ml-2 text-muted-foreground">
                ({selectedVariants[variant.name]})
              </span>
            )}
          </Label>
          <div className="flex flex-wrap gap-2">
            {variant.options.map((option) => {
              const isSelected = selectedVariants[variant.name] === option;
              return (
                <Button
                  key={option}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => onChange(variant.name, option)}
                  className={cn(
                    "min-w-[60px]",
                    isSelected &&
                      "bg-gradient-to-r from-[#40E0D0] to-[#1E90FF] border-0"
                  )}
                  data-testid={`variant-option-${variant.name}-${option}`}
                >
                  {option}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
