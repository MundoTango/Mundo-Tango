import { Request, Response } from 'express';
import { ErrorHandler } from '../utils/errorHandler';
import { facebookMrBlueContextService } from '../services/FacebookMrBlueContextService';
class MrblueController {
  async applyFix(req: Request, res: Response) {
    try {
      // Implement logic to apply fix
      res.status(200).json({ message: 'Fix applied successfully' });
    } catch (error) {
      const errorHandler = new ErrorHandler(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  /**
   * Get Facebook Messenger context for a user
   * Fetches recent Facebook messages and formats them for Mr. Blue AI
   */
  async getFacebookContext(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { messageLimit } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'userId parameter is required' });
      }

      const context = await facebookMrBlueContextService.buildMrBlueContext(
        userId,
        req.body.additionalContext
      );

      if (!context.facebookContext) {
        return res.status(404).json({ 
          error: 'No Facebook connection found for this user',
          context 
        });
      }

      res.status(200).json({
        success: true,
        context
      });
    } catch (error) {
      const errorHandler = new ErrorHandler(error);
      res.status(500).json({ error: 'Failed to fetch Facebook context', details: errorHandler.message });
    }
  }

  /**
   * Send Mr. Blue's response back to Facebook Messenger
   */
  async sendToFacebook(req: Request, res: Response) {
    try {
      const { facebookUserId, message, pageAccessToken } = req.body;

      if (!facebookUserId || !message || !pageAccessToken) {
        return res.status(400).json({ 
          error: 'facebookUserId, message, and pageAccessToken are required' 
        });
      }

      const success = await facebookMrBlueContextService.sendMrBlueResponseToFacebook(
        facebookUserId,
        message,
        pageAccessToken
      );

      if (success) {
        res.status(200).json({ success: true, message: 'Message sent to Facebook' });
      } else {
        res.status(500).json({ success: false, error: 'Failed to send message to Facebook' });
      }
    } catch (error) {
      const errorHandler = new ErrorHandler(error);
      res.status(500).json({ error: 'Failed to send message to Facebook', details: errorHandler.message });
    }
  }
}
export { MrblueController };
