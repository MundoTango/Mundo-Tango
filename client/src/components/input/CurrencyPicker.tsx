import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENCY_OPTIONS, getCurrencySymbol } from "@/lib/currencyUtils";

interface CurrencyPickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CurrencyPicker({ value, onChange, disabled }: CurrencyPickerProps) {
  const selectedCurrency = CURRENCY_OPTIONS.find(c => c.value === value);
  const symbol = selectedCurrency?.symbol || '$';

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger data-testid="select-currency" className="flex items-center gap-2">
        <span className="text-lg font-semibold">{symbol}</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CURRENCY_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{option.symbol}</span>
              <span>{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
