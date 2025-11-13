import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "shipping" | "payment" | "review";

interface CheckoutWizardProps {
  onComplete: (data: CheckoutData) => void;
  isProcessing?: boolean;
}

export interface CheckoutData {
  shipping: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  payment: {
    method: string;
  };
  termsAccepted: boolean;
}

export function CheckoutWizard({ onComplete, isProcessing = false }: CheckoutWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>("shipping");
  const [formData, setFormData] = useState<CheckoutData>({
    shipping: {
      fullName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA",
    },
    payment: {
      method: "card",
    },
    termsAccepted: false,
  });

  const steps: { id: Step; label: string; icon: number }[] = [
    { id: "shipping", label: "Shipping", icon: 1 },
    { id: "payment", label: "Payment", icon: 2 },
    { id: "review", label: "Review", icon: 3 },
  ];

  const isStepComplete = (step: Step): boolean => {
    const currentIndex = steps.findIndex((s) => s.id === step);
    const activeIndex = steps.findIndex((s) => s.id === currentStep);
    return currentIndex < activeIndex;
  };

  const handleNext = () => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  const handleComplete = () => {
    if (formData.termsAccepted) {
      onComplete(formData);
    }
  };

  return (
    <div className="space-y-6" data-testid="checkout-wizard">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                  currentStep === step.id
                    ? "border-[#40E0D0] bg-gradient-to-r from-[#40E0D0]/20 to-[#1E90FF]/20 text-[#40E0D0]"
                    : isStepComplete(step.id)
                    ? "border-[#40E0D0] bg-[#40E0D0] text-white"
                    : "border-white/20 text-muted-foreground"
                )}
                data-testid={`step-indicator-${step.id}`}
              >
                {isStepComplete(step.id) ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="font-semibold">{step.icon}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  currentStep === step.id ? "text-[#40E0D0]" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-4",
                  isStepComplete(steps[index + 1].id)
                    ? "bg-[#40E0D0]"
                    : "bg-white/20"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card
        style={{
          background: "linear-gradient(180deg, rgba(10, 24, 40, 0.90) 0%, rgba(30, 144, 255, 0.10) 100%)",
          backdropFilter: "blur(16px)",
        }}
      >
        <CardHeader>
          <CardTitle>
            {currentStep === "shipping" && "Shipping Address"}
            {currentStep === "payment" && "Payment Method"}
            {currentStep === "review" && "Review Order"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentStep === "shipping" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.shipping.fullName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shipping: { ...formData.shipping, fullName: e.target.value },
                    })
                  }
                  data-testid="input-fullname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.shipping.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shipping: { ...formData.shipping, address: e.target.value },
                    })
                  }
                  data-testid="input-address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.shipping.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shipping: { ...formData.shipping, city: e.target.value },
                      })
                    }
                    data-testid="input-city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.shipping.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shipping: { ...formData.shipping, state: e.target.value },
                      })
                    }
                    data-testid="input-state"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.shipping.zipCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shipping: { ...formData.shipping, zipCode: e.target.value },
                      })
                    }
                    data-testid="input-zip"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.shipping.country}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shipping: { ...formData.shipping, country: e.target.value },
                      })
                    }
                    data-testid="input-country"
                  />
                </div>
              </div>
            </>
          )}

          {currentStep === "payment" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Secure payment processing powered by Stripe
              </p>
              <div className="p-4 border border-white/10 rounded-lg bg-black/20">
                <p className="text-sm">
                  You will be redirected to Stripe Checkout to complete your payment securely.
                </p>
              </div>
            </div>
          )}

          {currentStep === "review" && (
            <div className="space-y-4">
              <div className="p-4 border border-white/10 rounded-lg bg-black/20 space-y-2">
                <h4 className="font-medium">Shipping Address</h4>
                <div className="text-sm text-muted-foreground">
                  <p>{formData.shipping.fullName}</p>
                  <p>{formData.shipping.address}</p>
                  <p>
                    {formData.shipping.city}, {formData.shipping.state} {formData.shipping.zipCode}
                  </p>
                  <p>{formData.shipping.country}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, termsAccepted: checked as boolean })
                  }
                  data-testid="checkbox-terms"
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer">
                  I agree to the terms and conditions and privacy policy
                </Label>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            {currentStep !== "review" && (
              <Button
                className="ml-auto bg-gradient-to-r from-[#40E0D0] to-[#1E90FF] hover-elevate"
                onClick={handleNext}
                data-testid="button-next-step"
              >
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
            {currentStep === "review" && (
              <Button
                className="ml-auto bg-gradient-to-r from-[#40E0D0] to-[#1E90FF] hover-elevate"
                onClick={handleComplete}
                disabled={!formData.termsAccepted || isProcessing}
                data-testid="button-place-order"
              >
                {isProcessing ? "Processing..." : "Place Order"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
