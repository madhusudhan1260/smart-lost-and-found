// /api/users  – super admin only
import { Router } from 'express';
import { requireSuperAdmin } from '../middleware/auth.js';
import { createUser, deleteUser, listUsers, updateUser } from '../controllers/userController.js';

const router = Router();

router.use(requireSuperAdmin);
router.get('/', listUsers);
router.post('/', createUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
