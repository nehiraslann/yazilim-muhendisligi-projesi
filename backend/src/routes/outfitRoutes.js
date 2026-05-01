import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { createOutfit, getUserOutfits, deleteOutfit } from '../controllers/outfitController.js';

const router = express.Router();

router.get('/', authMiddleware, getUserOutfits);
router.post('/', authMiddleware, createOutfit);
router.delete('/:id', authMiddleware, deleteOutfit);

export default router;
