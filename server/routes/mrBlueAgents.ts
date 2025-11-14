import { Router, type Request, Response } from "express";
import { roleAdapterAgent, type SubscriptionTier } from "../services/mrBlue/roleAdapterAgent";
import { avatarAgent, type AvatarEmotion } from "../services/mrBlue/avatarAgent";
import { tourGuideAgent } from "../services/mrBlue/tourGuideAgent";
import { subscriptionAgent } from "../services/mrBlue/subscriptionAgent";
import { qualityValidatorAgent } from "../services/mrBlue/qualityValidatorAgent";

const router = Router();

router.post("/adapt-content", async (req: Request, res: Response) => {
  try {
    const { content, userTier } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content is required"
      });
    }

    const tier = (userTier || 'free') as SubscriptionTier;
    const result = await roleAdapterAgent.adaptContent(content, tier);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('[MrBlueAgents] Adapt content error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to adapt content"
    });
  }
});

router.get("/features/:tier", async (req: Request, res: Response) => {
  try {
    const { tier } = req.params;
    const features = await roleAdapterAgent.getAvailableFeatures(tier as SubscriptionTier);

    res.json({
      success: true,
      data: features
    });
  } catch (error: any) {
    console.error('[MrBlueAgents] Get features error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get features"
    });
  }
});

router.post("/suggest-upgrade", async (req: Request, res: Response) => {
  try {
    const { currentTier, desiredFeature } = req.body;

    if (!currentTier || !desiredFeature) {
      return res.status(400).json({
        success: false,
        message: "currentTier and desiredFeature are required"
      });
    }

    const suggestion = await roleAdapterAgent.suggestUpgrade(
      currentTier as SubscriptionTier,
      desiredFeature
    );

    res.json({
      success: true,
      data: suggestion
    });
  } catch (error: any) {
    console.error('[MrBlueAgents] Suggest upgrade error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to suggest upgrade"
    });
  }
});

router.post("/avatar/animate", async (req: Request, res: Response) => {
  try {
    const { emotion } = req.body;

    if (!emotion) {
      return res.status(400).json({
        success: false,
        message: "Emotion is required"
      });
    }

    const animation = await avatarAgent.generateAvatarAnimation(emotion as AvatarEmotion);

    res.json({
      success: true,
      data: animation
    });
  } catch (error: any) {
    console.error('[MrBlueAgents] Avatar animate error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate animation"
    });
  }
});

router.get("/avatar/model", async (_req: Request, res: Response) => {
  try {
    const model = await avatarAgent.loadAvatarModel();

    res.json({
      success: true,
      data: model
    });
  } catch (error: any) {
    console.error('[MrBlueAgents] Load avatar model error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to load avatar model"
    });
  }
});

router.get("/avatar/emotions", async (_req: Request, res: Response) => {
  try {
    const emotions = avatarAgent.getAvailableEmotions();

    res.json({
      success: true,
      data: emotions
    });
  } catch (error: any) {
    console.error('[MrBlueAgents] Get emotions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get emotions"
    });
  }
});

router.post("/avatar/sequence", async (req: Request, res: Response) => {
  try {
    const { emotions } = req.body;

    if (!Array.isArray(emotions)) {
      return res.status(400).json({
        success: false,
        message: "Emotions array is required"
      });
    }

    const sequence = await avatarAgent.getAnimationSequence(emotions as AvatarEmotion[]);

    res.json({
      success: true,
      data: sequence
    });
  } catch (error: any) {
    console.error('[MrBlueAgents] Avatar sequence error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate animation sequence"
    });
  }
});

router.post("/tour/create", async (req: Request, res: Response) => {
  try {
    const { userId, feature } = req.body;

    if (!userId || !feature) {
      return res.status(400).json({
        success: false,
        message: "userId and feature are required"
      });
    }

    const tour = await tourGuideAgent.createTour(userId, feature);

    res.json({
      success: true,
      data: tour
    });
  } catch (error: any) {
    console.error('[MrBlueAgents] Create tour error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create tour"
    });
  }
});

router.post("/tour/progress", async (req: Request, res: Response) => {
  try {
    const { userId, tourId, step } = req.body;

    if (!userId || !tourId || step === undefined) {
      return res.status(400).json({
        success: false,
        message: "userId, tourId, and step are required"
      });
    }

    await tourGuideAgent.trackProgress(userId, tourId, step);

    res.json({
      success: true,
      message: "Progress tracked successfully"
    });
  } catch (error: any) {
    console.error('[MrBlueAgents] Track progress error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to track progress"
    });
  }
});

router.post("/tour/complete", async (req: Request, res: Response) => {
  try {
    const { userId, tourId } = req.body;

    if (!userId || !tourId) {
      return res.status(400).json({
        success: false,
        message: "userId and tourId are required"
      });
    }

    await tourGuideAgent.completeTour(userId, tourId);

    res.json({
      success: true,
      message: "Tour completed successfully"
    });
  } catch (error: any) {
    console.error('[MrBlueAgents] Complete tour error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to complete tour"
    });
  }
});

router.get("/tour/list", async (_req: Request, res: Response) => {
  try {
    const tours = tourGuideAgent.getAvailableTours();

    res.json({
      success: true,
      data: tours
    });
  } catch (error: any) {
    console.error('[MrBlueAgents] Get tours error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get tours"
    });
  }
});

router.get("/tour/:feature", async (req: Request, res: Response) => {
  try {
    const { feature } = req.params;
    const tour = tourGuideAgent.getTourByFeature(feature);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found"
      });
    }

    res.json({
      success: true,
      data: tour
    });
  } catch (error: any) {
    console.error('[MrBlueAgents] Get tour by feature error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get tour"
    });
  }
});

router.get("/features/check", async (req: Request, res: Response) => {
  try {
    const { userId, feature } = req.query;

    if (!userId || !feature) {
      return res.status(400).json({
        success: false,
        message: "userId and feature query parameters are required"
      });
    }

    const available = await subscriptionAgent.isFeatureAvailable(
      parseInt(userId as string),
      feature as string
    );

    res.json({
      success: true,
      data: { available }
    });
  } catch (error: any) {
    console.error('[MrBlueAgents] Check feature error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to check feature availability"
    });
  }
});

router.get("/features/limits/:tier", async (req: Request, res: Response) => {
  try {
    const { tier } = req.params;
    const limits = subscriptionAgent.getFeatureLimits(tier as SubscriptionTier);

    res.json({
      success: true,
      data: limits
    });
  } catch (error: any) {
    console.error('[MrBlueAgents] Get limits error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get feature limits"
    });
  }
});

router.get("/features/quota", async (req: Request, res: Response) => {
  try {
    const { userId, feature } = req.query;

    if (!userId || !feature) {
      return res.status(400).json({
        success: false,
        message: "userId and feature query parameters are required"
      });
    }

    const quota = await subscriptionAgent.checkQuota(
      parseInt(userId as string),
      feature as string
    );

    res.json({
      success: true,
      data: quota
    });
  } catch (error: any) {
    console.error('[MrBlueAgents] Check quota error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to check quota"
    });
  }
});

router.post("/features/use", async (req: Request, res: Response) => {
  try {
    const { userId, feature } = req.body;

    if (!userId || !feature) {
      return res.status(400).json({
        success: false,
        message: "userId and feature are required"
      });
    }

    const canUse = await subscriptionAgent.canUseFeature(userId, feature);

    if (!canUse.allowed) {
      return res.status(403).json({
        success: false,
        message: canUse.reason,
        data: { quota: canUse.quota }
      });
    }

    await subscriptionAgent.incrementUsage(userId, feature);

    res.json({
      success: true,
      message: "Feature usage recorded",
      data: { quota: canUse.quota }
    });
  } catch (error: any) {
    console.error('[MrBlueAgents] Use feature error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to use feature"
    });
  }
});

router.post("/validate", async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Text is required"
      });
    }

    const validation = await qualityValidatorAgent.validatePostContent(text);

    res.json({
      success: true,
      data: validation
    });
  } catch (error: any) {
    console.error('[MrBlueAgents] Validate error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to validate content"
    });
  }
});

router.post("/improve", async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Text is required"
      });
    }

    const suggestions = await qualityValidatorAgent.suggestImprovements(text);

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error: any) {
    console.error('[MrBlueAgents] Improve error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate improvements"
    });
  }
});

router.post("/code-quality", async (req: Request, res: Response) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: "Code and language are required"
      });
    }

    const report = await qualityValidatorAgent.detectCodeQuality(code, language);

    res.json({
      success: true,
      data: report
    });
  } catch (error: any) {
    console.error('[MrBlueAgents] Code quality error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to analyze code quality"
    });
  }
});

router.post("/validate/batch", async (req: Request, res: Response) => {
  try {
    const { texts } = req.body;

    if (!Array.isArray(texts)) {
      return res.status(400).json({
        success: false,
        message: "Texts array is required"
      });
    }

    const results = await qualityValidatorAgent.batchValidate(texts);

    res.json({
      success: true,
      data: results
    });
  } catch (error: any) {
    console.error('[MrBlueAgents] Batch validate error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to batch validate"
    });
  }
});

router.post("/clean", async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Text is required"
      });
    }

    const cleaned = qualityValidatorAgent.cleanProfanity(text);

    res.json({
      success: true,
      data: { cleaned }
    });
  } catch (error: any) {
    console.error('[MrBlueAgents] Clean profanity error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to clean content"
    });
  }
});

export default router;
