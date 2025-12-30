import { Router, Response } from "express";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { db } from "@shared/db";
import { externalMessages } from "@shared/schema";

const router = Router();

router.get("/api/messages/external-contacts", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const contacts = await db.select().from(externalMessages).where(eq(externalMessages.userId, userId));
    res.json(contacts);
  } catch (error) {
    console.error("[Messages] Fetch external contacts error:", error);
    res.status(500).json({ error: "Failed to fetch external contacts" });
  }
});

router.post("/api/messages/reply-external/:contactId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { contactId } = req.params;
    const { body } = req.body;
    if (!body) {
      return res.status(400).json({ error: "Message body is required" });
    }
    // Logic to send email using the contactId and body
    // Assume sendEmail is a function that handles sending emails
    await sendEmail(contactId, "Reply from Mundo Tango", body);
    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("[Messages] Send email reply error:", error);
    res.status(500).json({ error: "Failed to send email reply" });
  }
});

export default router;