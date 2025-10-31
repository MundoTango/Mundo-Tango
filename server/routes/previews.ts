import { Router } from "express";
import { storage } from "../storage";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import type { Response } from "express";

const router = Router();

router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { name, description, gitBranch, gitCommitSha } = req.body;

    if (!name || !gitBranch) {
      return res.status(400).json({ message: "Name and git branch are required" });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const preview = await storage.createPreviewDeployment({
      userId,
      name,
      description: description || null,
      gitBranch,
      gitCommitSha: gitCommitSha || null,
      status: 'pending',
      previewUrl: null,
      deploymentId: null,
      expiresAt,
      expiredAt: null,
    });

    res.status(201).json({ preview });
  } catch (error) {
    console.error('Error creating preview deployment:', error);
    res.status(500).json({ message: "Failed to create preview deployment" });
  }
});

router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { status } = req.query;

    const previews = await storage.getPreviewDeployments({
      userId,
      status: status as string | undefined,
    });

    res.json({ previews });
  } catch (error) {
    console.error('Error fetching preview deployments:', error);
    res.status(500).json({ message: "Failed to fetch preview deployments" });
  }
});

router.get("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const preview = await storage.getPreviewDeploymentById(id);

    if (!preview) {
      return res.status(404).json({ message: "Preview deployment not found" });
    }

    if (preview.userId !== req.userId!) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json({ preview });
  } catch (error) {
    console.error('Error fetching preview deployment:', error);
    res.status(500).json({ message: "Failed to fetch preview deployment" });
  }
});

router.put("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const preview = await storage.getPreviewDeploymentById(id);

    if (!preview) {
      return res.status(404).json({ message: "Preview deployment not found" });
    }

    if (preview.userId !== req.userId!) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { status, previewUrl, deploymentId } = req.body;
    const updated = await storage.updatePreviewDeployment(id, {
      status,
      previewUrl,
      deploymentId,
    });

    res.json({ preview: updated });
  } catch (error) {
    console.error('Error updating preview deployment:', error);
    res.status(500).json({ message: "Failed to update preview deployment" });
  }
});

router.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const preview = await storage.getPreviewDeploymentById(id);

    if (!preview) {
      return res.status(404).json({ message: "Preview deployment not found" });
    }

    if (preview.userId !== req.userId!) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await storage.deletePreviewDeployment(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting preview deployment:', error);
    res.status(500).json({ message: "Failed to delete preview deployment" });
  }
});

router.post("/:id/expire", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const preview = await storage.getPreviewDeploymentById(id);

    if (!preview) {
      return res.status(404).json({ message: "Preview deployment not found" });
    }

    if (preview.userId !== req.userId!) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await storage.expirePreviewDeployment(id);
    res.json({ message: "Preview deployment expired" });
  } catch (error) {
    console.error('Error expiring preview deployment:', error);
    res.status(500).json({ message: "Failed to expire preview deployment" });
  }
});

export default router;