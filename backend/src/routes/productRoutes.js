import express from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware.js';
import { addProduct, getOptions, getProducts, updateProduct, deleteProduct } from '../controllers/productController.js';

const router = express.Router();

router.get('/options', getOptions);

router.get('/', getProducts);
router.post('/', authMiddleware, roleMiddleware(['Seller', 'Admin']), addProduct);
router.put('/:id', authMiddleware, roleMiddleware(['Seller', 'Admin']), updateProduct);
router.delete('/:id', authMiddleware, roleMiddleware(['Seller', 'Admin']), deleteProduct);

export default router;
