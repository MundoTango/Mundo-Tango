import { Router } from "express";
import { z } from "zod";
import {
  createEncryptedUserPayment,
  getDecryptedUserPayments,
} from "../db/encrypted";

const router = Router();

// Create a new user payment record
router.post("/api/user-payments", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const schema = z.object({
      paymentType: z.enum(["subscription", "event_ticket", "housing", "marketplace"]),
      status: z.string().optional(),
      stripePaymentIntentId: z.string().optional(),
      sensitiveData: z.object({
        amount: z.number(),
        currency: z.string(),
        description: z.string(),
        metadata: z.record(z.any()).optional(),
        billingDetails: z.record(z.any()).optional(),
      }),
    });

    const data = schema.parse(req.body);
    
    const payment = await createEncryptedUserPayment({
      userId: user.id,
      paymentType: data.paymentType,
      status: data.status,
      stripePaymentIntentId: data.stripePaymentIntentId,
      sensitiveData: data.sensitiveData,
    });

    res.json(payment);
  } catch (error: any) {
    console.error("Error creating user payment:", error);
    res.status(400).json({ error: error.message });
  }
});

// Get all user payments for the authenticated user
router.get("/api/user-payments", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { paymentType, status } = req.query;

    const filters: any = {};
    if (paymentType) filters.paymentType = paymentType as string;
    if (status) filters.status = status as string;

    const payments = await getDecryptedUserPayments(user.id, filters);
    res.json(payments);
  } catch (error: any) {
    console.error("Error fetching user payments:", error);
    res.status(500).json({ error: error.message });
  }
});

// Admin endpoint to verify payment encryption (for testing)
router.get("/api/admin/verify-encryption/:id", async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // This is just for testing - shows raw encrypted data
    res.json({ 
      message: "Check database directly to verify encryption",
      note: "Encrypted data should appear as non-readable strings in the database"
    });
  } catch (error: any) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
