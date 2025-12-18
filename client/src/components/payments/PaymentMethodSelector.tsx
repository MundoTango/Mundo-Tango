/**
 * PaymentMethodSelector.tsx
 * 
 * International Payment Method Selection Component
 * Shows available payment methods based on country/region
 * 
 * MB.MD Pattern 49: Phase 4 i18n & Multi-currency UX
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, Building2, Wallet, Globe } from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'wallet' | 'local';
  name: string;
  description?: string;
  icon?: string;
  processingTime?: string;
  fee?: number;
  feeType?: 'fixed' | 'percentage';
}

interface PaymentMethodSelectorProps {
  countryCode: string;
  currency: string;
  amount: number;
  onMethodSelect: (method: PaymentMethod) => void;
  selectedMethodId?: string;
}

const DEFAULT_METHODS: PaymentMethod[] = [
  { id: 'card', type: 'card', name: 'Credit/Debit Card', description: 'Visa, Mastercard, Amex', processingTime: 'Instant' },
  { id: 'bank_transfer', type: 'bank', name: 'Bank Transfer', description: 'Direct bank payment', processingTime: '1-3 days' },
];

const REGIONAL_METHODS: Record<string, PaymentMethod[]> = {
  'NL': [
    { id: 'ideal', type: 'bank', name: 'iDEAL', description: 'Dutch online banking', processingTime: 'Instant' },
  ],
  'DE': [
    { id: 'giropay', type: 'bank', name: 'Giropay', description: 'German online banking', processingTime: 'Instant' },
    { id: 'sofort', type: 'bank', name: 'SOFORT', description: 'Instant bank transfer', processingTime: 'Instant' },
  ],
  'BE': [
    { id: 'bancontact', type: 'bank', name: 'Bancontact', description: 'Belgian debit cards', processingTime: 'Instant' },
  ],
  'BR': [
    { id: 'pix', type: 'bank', name: 'PIX', description: 'Brazilian instant payment', processingTime: 'Instant' },
    { id: 'boleto', type: 'bank', name: 'Boleto', description: 'Brazilian bank slip', processingTime: '1-3 days' },
  ],
  'AR': [
    { id: 'mercadopago', type: 'wallet', name: 'Mercado Pago', description: 'Digital wallet', processingTime: 'Instant' },
  ],
  'MX': [
    { id: 'oxxo', type: 'local', name: 'OXXO', description: 'Pay at convenience store', processingTime: '1-3 days' },
  ],
  'CN': [
    { id: 'alipay', type: 'wallet', name: 'Alipay', description: 'Chinese digital wallet', processingTime: 'Instant' },
    { id: 'wechat_pay', type: 'wallet', name: 'WeChat Pay', description: 'WeChat wallet', processingTime: 'Instant' },
  ],
  'IN': [
    { id: 'upi', type: 'wallet', name: 'UPI', description: 'Unified Payment Interface', processingTime: 'Instant' },
  ],
  'KE': [
    { id: 'mpesa', type: 'wallet', name: 'M-Pesa', description: 'Mobile money', processingTime: 'Instant' },
  ],
  'JP': [
    { id: 'konbini', type: 'local', name: 'Konbini', description: 'Pay at convenience store', processingTime: '1-3 days' },
  ],
};

function getMethodIcon(type: string) {
  switch (type) {
    case 'card':
      return <CreditCard className="h-5 w-5" />;
    case 'bank':
      return <Building2 className="h-5 w-5" />;
    case 'wallet':
      return <Wallet className="h-5 w-5" />;
    case 'local':
      return <Globe className="h-5 w-5" />;
    default:
      return <CreditCard className="h-5 w-5" />;
  }
}

export function PaymentMethodSelector({
  countryCode,
  currency,
  amount,
  onMethodSelect,
  selectedMethodId
}: PaymentMethodSelectorProps) {
  const [selected, setSelected] = useState<string>(selectedMethodId || 'card');

  const { data: availableMethods, isLoading } = useQuery<PaymentMethod[]>({
    queryKey: ['/api/payments/methods', countryCode, currency],
    enabled: !!countryCode && !!currency,
    staleTime: 5 * 60 * 1000,
  });

  const methods = availableMethods || [
    ...DEFAULT_METHODS,
    ...(REGIONAL_METHODS[countryCode.toUpperCase()] || [])
  ];

  useEffect(() => {
    const method = methods.find(m => m.id === selected);
    if (method) {
      onMethodSelect(method);
    }
  }, [selected, methods, onMethodSelect]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="payment-method-selector">
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selected}
          onValueChange={setSelected}
          className="space-y-3"
        >
          {methods.map((method) => (
            <div
              key={method.id}
              className="flex items-center space-x-3 rounded-lg border p-4 hover-elevate cursor-pointer"
              onClick={() => setSelected(method.id)}
              data-testid={`payment-method-${method.id}`}
            >
              <RadioGroupItem value={method.id} id={method.id} />
              <div className="flex flex-1 items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    {getMethodIcon(method.type)}
                  </div>
                  <div>
                    <Label htmlFor={method.id} className="cursor-pointer font-medium">
                      {method.name}
                    </Label>
                    {method.description && (
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {method.processingTime && (
                    <Badge variant="secondary" className="text-xs">
                      {method.processingTime}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

export default PaymentMethodSelector;
