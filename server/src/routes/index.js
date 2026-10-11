// Combines every route under /api
import { Router } from 'express';
import { isDatabaseConnected } from '../config/db.js';
import { requireDoss } from '../middleware/auth.js';
import { login, me } from '../controllers/authController.js';
import { getStats } from '../controllers/statsController.js';
import { resetData } from '../controllers/adminController.js';
import itemRoutes from './itemRoutes.js';
import claimRoutes from './claimRoutes.js';

const router = Router();

// GET /api/health – is the API up and connected to MongoDB?
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', database: isDatabaseConnected() ? 'connected' : 'disconnected', time: new Date().toISOString() });
});

router.post('/auth/login', login);
router.get('/auth/me', requireDoss, me);

router.use('/items', itemRoutes);
router.use('/claims', claimRoutes);

router.get('/stats', getStats);
router.post('/admin/reset', requireDoss, resetData);

export default router;
