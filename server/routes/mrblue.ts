import express from 'express';
import { MrblueController } from '../controllers/mrblueController';
const router = express.Router();
const mrblueController = new MrblueController();
router.post('/apply-fix', mrblueController.applyFix);
export default router;