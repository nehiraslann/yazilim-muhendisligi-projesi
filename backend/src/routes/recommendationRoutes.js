import express from 'express';
import { getAIRecommendations } from '../controllers/recommendationController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// AI Kombin Önerisi İstekleri
router.post('/generate', authMiddleware, getAIRecommendations);

export default router;
