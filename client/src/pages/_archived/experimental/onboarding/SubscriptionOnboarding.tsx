import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { UnifiedLocationPicker, extractCityCountry } from "@/components/input/UnifiedLocationPicker";
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Crown,
  Sparkles,
  Zap,
  Users,
  TrendingUp,
  Shield,
  Clock,
  Star,
  Award,
  Lock,
  X,
  AlertCircle,
  MapPin,
} from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
}

interface Testimonial {
  name: string;
  location: string;
  text: string;
  rating: number;
}

const getTestimonials = (t: (key: string, fallback: string) => string): Testimonial[] => [
  {
    name: t('pages:onboarding.subscription.testimonials.maria.name', 'Maria Garcia'),
    location: t('pages:onboarding.subscription.testimonials.maria.location', 'Buenos Aires, Argentina'),
    text: t('pages:onboarding.subscription.testimonials.maria.text', 'Mundo Tango Pro helped me connect with dancers worldwide and find amazing milongas. The AI matching is incredible!'),
    rating: 5,
  },
  {
    name: t('pages:onboarding.subscription.testimonials.john.name', 'John Smith'),
    location: t('pages:onboarding.subscription.testimonials.john.location', 'New York, USA'),
    text: t('pages:onboarding.subscription.testimonials.john.text', 'Best investment for my tango journey. The Premium features are worth every penny. Mr. Blue is like having a personal tango assistant!'),
    rating: 5,
  },
  {
    name: t('pages:onboarding.subscription.testimonials.sophie.name', 'Sophie Laurent'),
    location: t('pages:onboarding.subscription.testimonials.sophie.location', 'Paris, France'),
    text: t('pages:onboarding.subscription.testimonials.sophie.text', 'The event organization tools save me hours every week. Can\'t imagine running my milongas without it!'),
    rating: 5,
  },
];

function CountdownTimer({ endTime }: { endTime: number }) {
  const [timeLeft, setTimeLeft] = useState(endTime - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(endTime - Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  if (timeLeft <= 0) return null;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <div className="flex items-center gap-2 text-primary" data-testid="countdown-timer">
      <Clock className="w-5 h-5" />
      <span className="font-mono text-lg font-bold">
        {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
}

function SocialProof({ t }: { t: (key: string, fallback: string) => string }) {
  return (
    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground" data-testid="social-proof">
      <div className="flex -space-x-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-background"
          />
        ))}
      </div>
      <span>
        <span className="font-semibold text-foreground">{t('pages:onboarding.subscription.socialProof.count', '523 people')}</span> {t('pages:onboarding.subscription.socialProof.upgraded', 'upgraded this week')}
      </span>
    </div>
  );
}

function StepIndicator({ currentStep, totalSteps, t }: { currentStep: number; totalSteps: number; t: (key: string, fallback: string, options?: any) => string }) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="space-y-3" data-testid="step-indicator">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{t('pages:onboarding.subscription.stepIndicator', 'Step {{current}} of {{total}}', { current: currentStep + 1, total: totalSteps })}</span>
        <span>{t('pages:onboarding.subscription.percentComplete', '{{percent}}% complete', { percent: Math.round(progress) })}</span>
      </div>
      <Progress value={progress} className="h-2" data-testid="progress-bar" />
      <div className="flex justify-between gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-colors ${
              i <= currentStep ? 'bg-primary' : 'bg-muted'
            }`}
            data-testid={`step-dot-${i}`}
          />
        ))}
      </div>
    </div>
  );
}

function WelcomeStep({ onNext, t }: { onNext: () => void; t: (key: string, fallback: string) => string }) {
  return (
    <div className="space-y-8 text-center" data-testid="step-welcome">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold">{t('pages:onboarding.subscription.welcome.limitedOffer', 'Limited Time Offer')}</span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
          {t('pages:onboarding.subscription.welcome.title', 'Welcome to Premium Tango')}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('pages:onboarding.subscription.welcome.subtitle', "Join thousands of dancers who've elevated their tango journey with exclusive features, AI-powered matching, and unlimited access to global events.")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card className="hover-elevate">
          <CardContent className="pt-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">{t('pages:onboarding.subscription.welcome.features.connect.title', 'Connect Globally')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('pages:onboarding.subscription.welcome.features.connect.description', 'Advanced matching algorithm connects you with perfect dance partners worldwide')}
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardContent className="pt-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
              <TrendingUp className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="font-semibold text-lg">{t('pages:onboarding.subscription.welcome.features.grow.title', 'Grow Your Skills')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('pages:onboarding.subscription.welcome.features.grow.description', 'Access exclusive workshops, tutorials, and personalized learning paths')}
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardContent className="pt-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
              <Crown className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold text-lg">{t('pages:onboarding.subscription.welcome.features.premium.title', 'Premium Access')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('pages:onboarding.subscription.welcome.features.premium.description', 'Unlimited event creation, priority support, and early feature access')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto text-sm">
          {getTestimonials(t).map((testimonial, i) => (
            <Card key={i} className="hover-elevate">
              <CardContent className="pt-6 space-y-3">
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm italic">{testimonial.text}</p>
                <div className="text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p>{testimonial.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Button
          size="lg"
          className="text-lg px-8 py-6"
          onClick={onNext}
          data-testid="button-get-started"
        >
          {t('pages:onboarding.subscription.welcome.getStarted', 'Get Started')}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <SocialProof t={t} />
      </div>
    </div>
  );
}

function PlanSelectionStep({
  plans,
  selectedPlanId,
  onSelectPlan,
  onNext,
  onBack,
  t,
}: {
  plans: Plan[];
  selectedPlanId: string;
  onSelectPlan: (planId: string) => void;
  onNext: () => void;
  onBack: () => void;
  t: (key: string, fallback: string) => string;
}) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const offerEndTime = Date.now() + 15 * 60 * 1000;

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Users className="w-6 h-6" />;
      case 'basic':
        return <Zap className="w-6 h-6" />;
      case 'pro':
        return <TrendingUp className="w-6 h-6" />;
      case 'premium':
        return <Crown className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  const getDiscountedPrice = (price: number) => {
    return billingPeriod === 'yearly' ? price * 12 * 0.8 : price;
  };

  return (
    <div className="space-y-8" data-testid="step-plan-selection">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4">
          <h2 className="text-3xl lg:text-4xl font-bold">{t('pages:onboarding.subscription.plans.title', 'Choose Your Plan')}</h2>
          <Badge variant="destructive" className="text-sm">
            <CountdownTimer endTime={offerEndTime} />
          </Badge>
        </div>
        <p className="text-lg text-muted-foreground">
          {t('pages:onboarding.subscription.plans.subtitle', 'Special offer ends soon! Save 20% with yearly billing')}
        </p>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Label htmlFor="billing-toggle" className={billingPeriod === 'monthly' ? 'font-semibold' : ''}>
          {t('pages:onboarding.subscription.plans.monthly', 'Monthly')}
        </Label>
        <Switch
          id="billing-toggle"
          checked={billingPeriod === 'yearly'}
          onCheckedChange={(checked) => setBillingPeriod(checked ? 'yearly' : 'monthly')}
          data-testid="switch-billing-period"
        />
        <Label htmlFor="billing-toggle" className={billingPeriod === 'yearly' ? 'font-semibold' : ''}>
          {t('pages:onboarding.subscription.plans.yearly', 'Yearly')}
          <Badge variant="secondary" className="ml-2">{t('pages:onboarding.subscription.plans.save20', 'Save 20%')}</Badge>
        </Label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          const isPro = plan.id === 'pro';
          const displayPrice = getDiscountedPrice(plan.price);
          const isYearly = billingPeriod === 'yearly';

          return (
            <Card
              key={plan.id}
              className={`relative hover-elevate cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-primary shadow-lg' : ''
              } ${isPro ? 'border-primary border-2' : ''}`}
              onClick={() => onSelectPlan(plan.id)}
              data-testid={`plan-card-${plan.id}`}
            >
              {isPro && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    <Award className="w-3 h-3 mr-1" />
                    {t('pages:onboarding.subscription.plans.mostPopular', 'Most Popular')}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                  {getPlanIcon(plan.id)}
                </div>
                <div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    {plan.price > 0 ? (
                      <div className="space-y-1">
                        <div className="text-3xl font-bold">
                          ${displayPrice.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {isYearly ? '/year' : '/month'}
                        </div>
                        {isYearly && (
                          <div className="text-xs line-through text-muted-foreground">
                            ${(plan.price * 12).toFixed(2)}/year
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-3xl font-bold">{t('pages:onboarding.subscription.plans.free', 'Free')}</div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <Separator />
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={isSelected ? 'default' : 'outline'}
                  className="w-full"
                  data-testid={`button-select-${plan.id}`}
                >
                  {isSelected ? t('pages:onboarding.subscription.plans.selected', 'Selected') : t('pages:onboarding.subscription.plans.selectPlan', 'Select Plan')}
                </Button>
                {plan.id === 'basic' && (
                  <p className="text-xs text-center text-muted-foreground">
                    {t('pages:onboarding.subscription.plans.freeTrial', 'Cancel anytime, 30-day money-back guarantee')}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
        <Shield className="w-5 h-5 text-primary" />
        <span>{t('pages:onboarding.subscription.plans.guarantee', '30-day money-back guarantee • Cancel anytime')}</span>
      </div>

      <div className="flex gap-4 justify-center">
        <Button variant="outline" onClick={onBack} data-testid="button-back">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common:buttons.back', 'Back')}
        </Button>
        <Button
          size="lg"
          onClick={onNext}
          disabled={!selectedPlanId}
          data-testid="button-continue-plan"
        >
          {t('common:buttons.continue', 'Continue')}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function ProfileCompletionStep({
  onNext,
  onBack,
  onSkip,
  t,
}: {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  t: (key: string, fallback: string, options?: any) => string;
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    location: '',
    city: '',
    country: '',
    tangoRoles: [] as string[],
  });

  const completionPercentage = Math.round(
    (Object.values(formData).filter((v) => Array.isArray(v) ? v.length > 0 : (typeof v === 'string' && v.trim())).length / 5) * 100
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8" data-testid="step-profile-completion">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">{t('pages:onboarding.subscription.profile.title', 'Complete Your Profile')}</h2>
        <p className="text-lg text-muted-foreground">
          {t('pages:onboarding.subscription.profile.subtitle', 'Help us personalize your experience (optional)')}
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('pages:onboarding.subscription.profile.completion', 'Profile Completion')}</span>
            <span className="font-semibold">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" data-testid="profile-progress" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('pages:onboarding.subscription.profile.firstName', 'First Name')}</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder={t('pages:onboarding.subscription.profile.firstNamePlaceholder', 'Maria')}
                  data-testid="input-first-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t('pages:onboarding.subscription.profile.lastName', 'Last Name')}</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder={t('pages:onboarding.subscription.profile.lastNamePlaceholder', 'Garcia')}
                  data-testid="input-last-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">{t('pages:onboarding.subscription.profile.location', 'Location')}</Label>
              <UnifiedLocationPicker
                mode="city"
                value={formData.location}
                onChange={(loc, coords, parsed) => {
                  setFormData({
                    ...formData,
                    location: loc,
                    city: parsed?.city || '',
                    country: parsed?.country || ''
                  });
                }}
                placeholder={t('pages:onboarding.subscription.profile.locationPlaceholder', 'Search for your city...')}
              />
              {formData.city && formData.country && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 mt-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{formData.city}, {formData.country}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('pages:onboarding.subscription.profile.tangoRoles', 'Tango Roles (select all that apply)')}</Label>
              <div className="flex flex-wrap gap-2">
                {['Leader', 'Follower', 'Both'].map((role) => (
                  <Button
                    key={role}
                    type="button"
                    variant={formData.tangoRoles.includes(role) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        tangoRoles: formData.tangoRoles.includes(role)
                          ? formData.tangoRoles.filter((r) => r !== role)
                          : [...formData.tangoRoles, role],
                      });
                    }}
                    data-testid={`button-role-${role.toLowerCase()}`}
                  >
                    {t(`pages:onboarding.subscription.profile.role${role}`, role)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" onClick={onBack} type="button" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common:buttons.back', 'Back')}
          </Button>
          <Button variant="ghost" onClick={onSkip} type="button" data-testid="button-skip">
            {t('pages:onboarding.subscription.profile.skipForNow', 'Skip for Now')}
          </Button>
          <Button size="lg" type="submit" data-testid="button-continue-profile">
            {t('common:buttons.continue', 'Continue')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
}

function PaymentStepForm({
  plan,
  onSuccess,
  t,
}: {
  plan: Plan;
  onSuccess: () => void;
  t: (key: string, fallback: string, options?: any) => string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/onboarding/success`,
        },
      });

      if (error) {
        toast({
          title: t('pages:onboarding.subscription.payment.errors.paymentFailed', 'Payment Failed'),
          description: error.message,
          variant: "destructive",
        });
      } else {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: t('common:errors.error', 'Error'),
        description: error.message || t('common:errors.somethingWentWrong', 'Something went wrong'),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="w-4 h-4" />
          <span>{t('pages:onboarding.subscription.payment.securePayment', 'Secure payment powered by Stripe')}</span>
        </div>
        <PaymentElement />
      </div>

      <div className="space-y-3">
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={!stripe || isProcessing}
          data-testid="button-complete-payment"
        >
          {isProcessing ? t('pages:onboarding.subscription.payment.processing', 'Processing...') : t('pages:onboarding.subscription.payment.subscribeTo', 'Subscribe to {{plan}} - ${{price}}/{{interval}}', { plan: plan.name, price: plan.price, interval: plan.interval })}
        </Button>
        
        <p className="text-xs text-center text-muted-foreground">
          {t('pages:onboarding.subscription.payment.termsNotice', 'By confirming your subscription, you allow Mundo Tango to charge your card for this payment and future payments in accordance with their terms.')}
        </p>
      </div>
    </form>
  );
}

function PaymentStep({
  plan,
  onBack,
  onSuccess,
  t,
}: {
  plan: Plan | null;
  onBack: () => void;
  onSuccess: () => void;
  t: (key: string, fallback: string, options?: any) => string;
}) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const { toast } = useToast();

  const createSubscriptionMutation = useMutation({
    mutationFn: async () => {
      if (!plan) throw new Error('No plan selected');
      const response = await apiRequest('POST', '/api/billing/create-subscription', {
        planId: plan.id,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else if (data.tier === 'free') {
        onSuccess();
      }
    },
    onError: (error: any) => {
      toast({
        title: t('common:errors.error', 'Error'),
        description: error.message || t('pages:onboarding.subscription.payment.errors.createFailed', 'Failed to create subscription'),
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (plan && plan.price > 0) {
      createSubscriptionMutation.mutate();
    }
  }, [plan]);

  if (!plan) {
    return (
      <div className="text-center" data-testid="no-plan-selected">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <p className="text-muted-foreground">{t('pages:onboarding.subscription.payment.noPlanSelected', 'No plan selected. Please go back and select a plan.')}</p>
        <Button onClick={onBack} className="mt-4" data-testid="button-back">
          {t('pages:onboarding.subscription.payment.goBack', 'Go Back')}
        </Button>
      </div>
    );
  }

  if (plan.price === 0) {
    useEffect(() => {
      createSubscriptionMutation.mutate();
    }, []);
    
    return (
      <div className="text-center space-y-4" data-testid="free-plan-selected">
        <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
        <h3 className="text-2xl font-bold">{t('pages:onboarding.subscription.payment.welcomeFree', 'Welcome to Mundo Tango!')}</h3>
        <p className="text-muted-foreground">{t('pages:onboarding.subscription.payment.allSetFree', "You're all set with the Free plan.")}</p>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="text-center" data-testid="loading-payment">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">{t('pages:onboarding.subscription.payment.preparing', 'Preparing your subscription...')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8" data-testid="step-payment">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">{t('pages:onboarding.subscription.payment.title', 'Complete Your Subscription')}</h2>
        <p className="text-lg text-muted-foreground">
          {t('pages:onboarding.subscription.payment.subtitle', 'Secure payment for {{plan}} plan', { plan: plan.name })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('pages:onboarding.subscription.payment.summary', 'Payment Summary')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>{t('pages:onboarding.subscription.payment.planLabel', 'Plan')}</span>
              <span className="font-semibold">{plan.name}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('pages:onboarding.subscription.payment.billingLabel', 'Billing')}</span>
              <span className="font-semibold">{plan.interval}ly</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>{t('pages:onboarding.subscription.payment.totalLabel', 'Total')}</span>
              <span>${plan.price}/{plan.interval}</span>
            </div>

            {plan.id === 'basic' && (
              <div className="p-3 bg-primary/10 rounded-lg space-y-1">
                <p className="font-semibold text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {t('pages:onboarding.subscription.payment.freeTrialTitle', 'Full Access Included')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('pages:onboarding.subscription.payment.freeTrialDesc', 'Cancel anytime. 30-day money-back guarantee.')}
                </p>
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{t('pages:onboarding.subscription.payment.guarantee30Day', '30-day money-back guarantee')}</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{t('pages:onboarding.subscription.payment.cancelAnytime', 'Cancel anytime')}</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{t('pages:onboarding.subscription.payment.instantAccess', 'Instant access to all features')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('pages:onboarding.subscription.payment.paymentInfo', 'Payment Information')}</CardTitle>
            <CardDescription>{t('pages:onboarding.subscription.payment.enterDetails', 'Enter your payment details')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                },
              }}
            >
              <PaymentStepForm plan={plan} onSuccess={onSuccess} t={t} />
            </Elements>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" onClick={onBack} data-testid="button-back">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common:buttons.back', 'Back')}
        </Button>
      </div>
    </div>
  );
}

export default function SubscriptionOnboarding() {
  const { t } = useTranslation(["pages", "common"]);
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [showExitIntent, setShowExitIntent] = useState(false);
  const { toast } = useToast();

  const { data: plansData } = useQuery({
    queryKey: ['/api/billing/plans'],
  });

  const plans: Plan[] = plansData?.plans || [];
  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || null;

  const totalSteps = 4;

  const startOnboardingMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/onboarding/start', {});
      return response.json();
    },
  });

  const updateStepMutation = useMutation({
    mutationFn: async (step: number) => {
      const response = await apiRequest('PATCH', '/api/onboarding/step', { step });
      return response.json();
    },
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/onboarding/complete', {
        planId: selectedPlanId,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('pages:onboarding.subscription.complete.title', 'Welcome to Mundo Tango!'),
        description: t('pages:onboarding.subscription.complete.description', 'Your subscription is now active.'),
      });
      setLocation('/volunteer');
    },
  });

  useEffect(() => {
    startOnboardingMutation.mutate();
  }, []);

  useEffect(() => {
    updateStepMutation.mutate(currentStep);
  }, [currentStep]);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && currentStep > 0 && currentStep < totalSteps - 1) {
        setShowExitIntent(true);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handlePaymentSuccess = () => {
    completeOnboardingMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4" data-testid="subscription-onboarding">
      <div className="max-w-7xl mx-auto space-y-8">
        {currentStep > 0 && <StepIndicator currentStep={currentStep} totalSteps={totalSteps} t={t} />}

        {currentStep === 0 && <WelcomeStep onNext={handleNext} t={t} />}

        {currentStep === 1 && (
          <PlanSelectionStep
            plans={plans}
            selectedPlanId={selectedPlanId}
            onSelectPlan={setSelectedPlanId}
            onNext={handleNext}
            onBack={handleBack}
            t={t}
          />
        )}

        {currentStep === 2 && (
          <ProfileCompletionStep onNext={handleNext} onBack={handleBack} onSkip={handleSkip} t={t} />
        )}

        {currentStep === 3 && (
          <PaymentStep plan={selectedPlan} onBack={handleBack} onSuccess={handlePaymentSuccess} t={t} />
        )}
      </div>

      {showExitIntent && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md relative" data-testid="exit-intent-modal">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={() => setShowExitIntent(false)}
              data-testid="button-close-exit-intent"
            >
              <X className="w-4 h-4" />
            </Button>
            <CardHeader>
              <CardTitle className="text-2xl">{t('pages:onboarding.subscription.exitIntent.title', 'Wait! Before You Go...')}</CardTitle>
              <CardDescription>
                {t('pages:onboarding.subscription.exitIntent.subtitle', 'Get an exclusive 20% discount on your first year!')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg text-center">
                <p className="text-3xl font-bold text-primary">{t('pages:onboarding.subscription.exitIntent.discount', '20% OFF')}</p>
                <p className="text-sm text-muted-foreground">{t('pages:onboarding.subscription.exitIntent.applied', 'Applied at checkout')}</p>
              </div>
              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => {
                    setShowExitIntent(false);
                    setCurrentStep(1);
                  }}
                  data-testid="button-claim-offer"
                >
                  {t('pages:onboarding.subscription.exitIntent.claimDiscount', 'Claim My Discount')}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowExitIntent(false)}
                  data-testid="button-continue-browsing"
                >
                  {t('pages:onboarding.subscription.exitIntent.continueBrowsing', 'Continue Browsing')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
