/**
 * CurrencySelector.tsx
 * 
 * Multi-Currency Selection Component
 * Displays currencies with real-time conversion preview
 * 
 * MB.MD Pattern 49: Phase 4 i18n & Multi-currency UX
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  region: string;
}

interface CurrencySelectorProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
  amount?: number;
  baseCurrency?: string;
  showConversion?: boolean;
  className?: string;
}

const POPULAR_CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', region: 'US' },
  { code: 'EUR', name: 'Euro', symbol: '€', region: 'EU' },
  { code: 'GBP', name: 'British Pound', symbol: '£', region: 'EU' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$', region: 'LATAM' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', region: 'LATAM' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', region: 'LATAM' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', region: 'APAC' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', region: 'APAC' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', region: 'APAC' },
  { code: 'AUD', name: 'Australian Dollar', symbol: '$', region: 'APAC' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$', region: 'US' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', region: 'EU' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', region: 'AFRICA' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', region: 'AFRICA' },
];

const REGION_FLAGS: Record<string, string> = {
  'US': '🇺🇸',
  'EU': '🇪🇺',
  'LATAM': '🌎',
  'APAC': '🌏',
  'AFRICA': '🌍',
  'MENA': '🌍',
};

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function CurrencySelector({
  selectedCurrency,
  onCurrencyChange,
  amount,
  baseCurrency = 'USD',
  showConversion = true,
  className = ''
}: CurrencySelectorProps) {
  const [conversionRate, setConversionRate] = useState<number | null>(null);

  const { data: rateData, isLoading: isLoadingRate } = useQuery<{ rate: number }>({
    queryKey: ['/api/payments/exchange-rate', baseCurrency, selectedCurrency],
    enabled: showConversion && !!amount && baseCurrency !== selectedCurrency,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (rateData?.rate) {
      setConversionRate(rateData.rate);
    } else if (baseCurrency === selectedCurrency) {
      setConversionRate(1);
    }
  }, [rateData, baseCurrency, selectedCurrency]);

  const selectedCurrencyInfo = POPULAR_CURRENCIES.find(c => c.code === selectedCurrency);
  const convertedAmount = amount && conversionRate ? amount * conversionRate : null;

  return (
    <div className={`space-y-2 ${className}`}>
      <Select value={selectedCurrency} onValueChange={onCurrencyChange}>
        <SelectTrigger data-testid="currency-selector" className="w-full">
          <SelectValue>
            {selectedCurrencyInfo && (
              <span className="flex items-center gap-2">
                <span>{selectedCurrencyInfo.symbol}</span>
                <span>{selectedCurrencyInfo.code}</span>
                <Badge variant="outline" className="text-xs">
                  {selectedCurrencyInfo.region}
                </Badge>
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(
            POPULAR_CURRENCIES.reduce((acc, currency) => {
              if (!acc[currency.region]) acc[currency.region] = [];
              acc[currency.region].push(currency);
              return acc;
            }, {} as Record<string, Currency[]>)
          ).map(([region, currencies]) => (
            <div key={region}>
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                {REGION_FLAGS[region]} {region}
              </div>
              {currencies.map((currency) => (
                <SelectItem
                  key={currency.code}
                  value={currency.code}
                  data-testid={`currency-option-${currency.code}`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-6 text-center">{currency.symbol}</span>
                    <span>{currency.code}</span>
                    <span className="text-muted-foreground">- {currency.name}</span>
                  </span>
                </SelectItem>
              ))}
            </div>
          ))}
        </SelectContent>
      </Select>

      {showConversion && amount && baseCurrency !== selectedCurrency && (
        <Card className="bg-muted/50">
          <CardContent className="p-3">
            {isLoadingRate ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : convertedAmount !== null ? (
              <div className="text-sm" data-testid="currency-conversion-preview">
                <span className="text-muted-foreground">
                  {formatCurrency(amount, baseCurrency)} ≈{' '}
                </span>
                <span className="font-medium">
                  {formatCurrency(convertedAmount, selectedCurrency)}
                </span>
                {conversionRate && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (1 {baseCurrency} = {conversionRate.toFixed(4)} {selectedCurrency})
                  </span>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function CurrencyDisplay({ amount, currency }: { amount: number; currency: string }) {
  return (
    <span data-testid={`currency-display-${currency}`}>
      {formatCurrency(amount, currency)}
    </span>
  );
}

export default CurrencySelector;
