/**
 * payment-routes.ts
 * 
 * International Payment System API Routes
 * Exposes payment orchestration, currency, compliance, and webhook endpoints
 * 
 * MB.MD Pattern 49: International Payments Architecture
 */

import { Router, Request, Response, NextFunction } from 'express';
import { PaymentOrchestrator, PaymentGateway, PaymentMethod, PaymentStatus } from '../services/PaymentOrchestrator';
import { currencyManager } from '../services/CurrencyManager';
import { webhookDispatcher } from '../services/WebhookDispatcher';
import { amlKycVerifier, VerificationLevel } from '../services/AMLKYCVerifier';
import { taxCalculator } from '../services/TaxCalculator';
import { sanctionsScreener } from '../services/SanctionsScreener';
import { adyenAdapter } from '../services/AdyenAdapter';
import { wiseAdapter } from '../services/WiseAdapter';
import { localPaymentMethods, LocalPaymentType } from '../services/LocalPaymentMethods';

const router = Router();
const paymentOrchestrator = new PaymentOrchestrator();

/**
 * Authentication middleware for sensitive payment operations
 * Verifies user session before processing payments
 */
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.userId) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please log in to access payment features'
    });
  }
  next();
};

router.post('/process', requireAuth, async (req: Request, res: Response) => {
  try {
    const { amount, currency, tierId, billingInterval, paymentMethod, gateway, metadata } = req.body;
    const userId = req.session!.userId;

    if (!amount || !currency) {
      return res.status(400).json({ error: 'Missing required fields: amount, currency' });
    }

    // Validate currency is supported
    const supportedCurrencies = currencyManager.getSupportedCurrencies().map(c => c.code);
    if (!supportedCurrencies.includes(currency.toUpperCase())) {
      return res.status(400).json({ 
        error: 'Unsupported currency',
        message: `Currency ${currency} is not supported. Supported: ${supportedCurrencies.join(', ')}`
      });
    }

    // Check if payment gateway is configured
    if (!paymentOrchestrator.isConfigured()) {
      return res.status(503).json({ 
        error: 'Payment system unavailable',
        message: 'Payment gateway is not configured'
      });
    }

    const sanctionCheck = await sanctionsScreener.screenEntity({
      userId,
      name: req.body.customerName || 'Unknown',
      countryCode: req.body.countryCode
    });

    if (sanctionCheck.countryBlocked) {
      return res.status(403).json({
        error: 'Payment blocked',
        reason: 'Country is under sanctions',
        countryCode: sanctionCheck.blockedCountryCode
      });
    }

    const result = await paymentOrchestrator.processPayment({
      userId,
      amount,
      currency,
      tierId: tierId || 1,
      billingInterval: billingInterval || 'monthly',
      paymentMethod,
      gateway,
      metadata
    });

    res.json(result);
  } catch (error: any) {
    console.error('[PaymentRoutes] Process payment error:', error);
    res.status(500).json({ error: error.message || 'Payment processing failed' });
  }
});

router.get('/methods', async (req: Request, res: Response) => {
  try {
    const { countryCode, currency, amount } = req.query;

    if (!countryCode || !currency) {
      return res.status(400).json({ error: 'Missing required query params: countryCode, currency' });
    }

    const localMethods = localPaymentMethods.getAvailableMethods(
      countryCode as string,
      currency as string
    );

    const methods = [
      { id: 'card', type: 'card', name: 'Credit/Debit Card', description: 'Visa, Mastercard, Amex', processingTime: 'Instant' },
      { id: 'bank_transfer', type: 'bank', name: 'Bank Transfer', description: 'Direct bank payment', processingTime: '1-3 days' },
      ...localMethods.map(m => ({
        id: m.type,
        type: m.type.includes('wallet') ? 'wallet' : 'local',
        name: m.name,
        processingTime: m.processingTime,
        countries: m.countries,
        currencies: m.currencies
      }))
    ];

    res.json(methods);
  } catch (error: any) {
    console.error('[PaymentRoutes] Get methods error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/currencies', async (_req: Request, res: Response) => {
  try {
    const currencies = currencyManager.getSupportedCurrencies();
    res.json(currencies);
  } catch (error: any) {
    console.error('[PaymentRoutes] Get currencies error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/currencies/:region', async (req: Request, res: Response) => {
  try {
    const { region } = req.params;
    const currencies = currencyManager.getCurrenciesByRegion(region.toUpperCase());
    res.json(currencies);
  } catch (error: any) {
    console.error('[PaymentRoutes] Get currencies by region error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/exchange-rate', async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'Missing required query params: from, to' });
    }

    // Validate currencies are supported
    const supportedCurrencies = currencyManager.getSupportedCurrencies().map(c => c.code);
    const fromUpper = (from as string).toUpperCase();
    const toUpper = (to as string).toUpperCase();
    
    if (!supportedCurrencies.includes(fromUpper)) {
      return res.status(400).json({ 
        error: 'Unsupported source currency',
        message: `Currency ${from} is not supported`
      });
    }
    if (!supportedCurrencies.includes(toUpper)) {
      return res.status(400).json({ 
        error: 'Unsupported target currency',
        message: `Currency ${to} is not supported`
      });
    }

    const rate = await currencyManager.getRate(fromUpper, toUpper);
    res.json({ from: fromUpper, to: toUpper, rate, timestamp: new Date() });
  } catch (error: any) {
    console.error('[PaymentRoutes] Get exchange rate error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/convert', async (req: Request, res: Response) => {
  try {
    const { amount, from, to } = req.body;

    if (!amount || !from || !to) {
      return res.status(400).json({ error: 'Missing required fields: amount, from, to' });
    }

    const converted = await currencyManager.convertCurrency(amount, from, to);
    const formatted = currencyManager.formatCurrency(converted, to);

    res.json({
      original: { amount, currency: from },
      converted: { amount: converted, currency: to, formatted }
    });
  } catch (error: any) {
    console.error('[PaymentRoutes] Convert currency error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/tax', async (req: Request, res: Response) => {
  try {
    const { amount, countryCode, region, isDigitalService } = req.query;

    if (!amount || !countryCode) {
      return res.status(400).json({ error: 'Missing required query params: amount, countryCode' });
    }

    const taxCalc = taxCalculator.calculateTax(
      parseFloat(amount as string),
      countryCode as string,
      {
        region: region as string,
        isDigitalService: isDigitalService === 'true'
      }
    );

    res.json(taxCalc);
  } catch (error: any) {
    console.error('[PaymentRoutes] Calculate tax error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/compliance/screen', requireAuth, async (req: Request, res: Response) => {
  try {
    const { name, countryCode, email } = req.body;
    const userId = req.session!.userId;

    if (!name) {
      return res.status(400).json({ error: 'Missing required field: name' });
    }

    const result = await sanctionsScreener.screenEntity({
      userId,
      name,
      countryCode,
      email
    });

    res.json(result);
  } catch (error: any) {
    console.error('[PaymentRoutes] Sanctions screening error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/compliance/verify', requireAuth, async (req: Request, res: Response) => {
  try {
    const { email, fullName, countryCode, level } = req.body;
    const userId = req.session!.userId;

    if (!userId || !email || !fullName || !countryCode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await amlKycVerifier.createVerificationSession({
      userId,
      email,
      fullName,
      countryCode,
      level: level || VerificationLevel.STANDARD
    });

    res.json(result);
  } catch (error: any) {
    console.error('[PaymentRoutes] KYC verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/compliance/verification/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const result = await amlKycVerifier.checkVerificationStatus(sessionId);
    res.json(result);
  } catch (error: any) {
    console.error('[PaymentRoutes] Check verification status error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/wise/quote', requireAuth, async (req: Request, res: Response) => {
  try {
    const { sourceCurrency, targetCurrency, amount, isSourceAmount } = req.body;

    if (!sourceCurrency || !targetCurrency || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const quote = await wiseAdapter.createQuote(
      sourceCurrency,
      targetCurrency,
      amount,
      isSourceAmount !== false
    );

    res.json(quote);
  } catch (error: any) {
    console.error('[PaymentRoutes] Wise quote error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/adyen/methods', requireAuth, async (req: Request, res: Response) => {
  try {
    const { countryCode, currency, amount } = req.body;

    if (!countryCode || !currency || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const methods = await adyenAdapter.getPaymentMethods(countryCode, currency, amount);
    res.json(methods);
  } catch (error: any) {
    console.error('[PaymentRoutes] Adyen methods error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/local/:method', requireAuth, async (req: Request, res: Response) => {
  try {
    const { method } = req.params;
    const { amount, currency, orderId, customerEmail, customerName, returnUrl, metadata } = req.body;

    if (!amount || !currency || !orderId || !customerEmail || !customerName || !returnUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const methodType = method.toUpperCase() as LocalPaymentType;
    
    const result = await localPaymentMethods.createPayment({
      method: methodType,
      amount,
      currency,
      orderId,
      customerEmail,
      customerName,
      returnUrl,
      metadata
    });

    res.json(result);
  } catch (error: any) {
    console.error('[PaymentRoutes] Local payment error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/webhooks/stripe', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const payload = req.body;

    if (!signature) {
      return res.status(400).json({ error: 'Missing Stripe signature' });
    }

    const event = await webhookDispatcher.processStripeWebhook(payload, signature);
    res.json({ received: true, eventId: event.id });
  } catch (error: any) {
    console.error('[PaymentRoutes] Stripe webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/webhooks/adyen', async (req: Request, res: Response) => {
  try {
    const hmacSignature = req.headers['hmac-signature'] as string;
    const payload = req.body;

    // Require HMAC signature for security
    if (!hmacSignature) {
      return res.status(400).json({ error: 'Missing Adyen HMAC signature' });
    }

    const event = await webhookDispatcher.processAdyenWebhook(payload, hmacSignature);
    res.json({ received: true, eventId: event.id });
  } catch (error: any) {
    console.error('[PaymentRoutes] Adyen webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/webhooks/wise', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-signature'] as string;
    const payload = req.body;

    // Require signature for security
    if (!signature) {
      return res.status(400).json({ error: 'Missing Wise signature' });
    }

    const event = await webhookDispatcher.processWiseWebhook(payload, signature);
    res.json({ received: true, eventId: event.id });
  } catch (error: any) {
    console.error('[PaymentRoutes] Wise webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/gateways/supported', async (_req: Request, res: Response) => {
  try {
    const gateways = [
      { id: 'stripe', name: 'Stripe', regions: ['US', 'EU', 'APAC', 'LATAM'], status: 'active' },
      { id: 'adyen', name: 'Adyen', regions: ['EU'], status: 'active' },
      { id: 'wise', name: 'Wise', regions: ['GLOBAL'], status: 'active' },
      { id: 'mercadopago', name: 'Mercado Pago', regions: ['LATAM'], status: 'planned' },
      { id: 'alipay', name: 'Alipay', regions: ['APAC'], status: 'planned' }
    ];
    res.json(gateways);
  } catch (error: any) {
    console.error('[PaymentRoutes] Get gateways error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/countries/blocked', async (_req: Request, res: Response) => {
  try {
    const blocked = sanctionsScreener.getBlockedCountries();
    const highRisk = sanctionsScreener.getHighRiskCountries();
    res.json({ blocked, highRisk });
  } catch (error: any) {
    console.error('[PaymentRoutes] Get blocked countries error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
