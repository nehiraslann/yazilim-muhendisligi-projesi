import express from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware.js';
import { 
  getUsers, toggleUserStatus, 
  getProducts, toggleProductStatus,
  getCategories, addCategory, updateCategory, deleteCategory,
  getColors, addColor, updateColor, deleteColor
} from '../controllers/adminController.js';

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware(['Admin'])); // Sadece Admin erişebilir

router.get('/users', getUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);

router.get('/products', getProducts);
router.patch('/products/:id/toggle-status', toggleProductStatus);

// Categories
router.get('/categories', getCategories);
router.post('/categories', addCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Colors
router.get('/colors', getColors);
router.post('/colors', addColor);
router.put('/colors/:id', updateColor);
router.delete('/colors/:id', deleteColor);

export default router;
