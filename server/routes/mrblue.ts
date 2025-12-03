import express from 'express';
import { MrblueController } from '../controllers/mrblueController';
const router = express.Router();
const mrblueController = new MrblueController();
router.post('/apply-fix', mrblueController.applyFix);

// Facebook Messenger integration routes
router.get('/facebook-context/:userId', mrblueController.getFacebookContext);
router.post('/facebook-send', mrblueController.sendToFacebook);
export default router;
