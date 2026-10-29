// /api/claims
import { Router } from 'express';
import { optionalAuth, requireDoss } from '../middleware/auth.js';
import { accept, createClaim, getClaim, listClaims, reject } from '../controllers/claimController.js';

const router = Router();

router.get('/', optionalAuth, listClaims); // public: statuses only · DOSS: full details
router.get('/:id', optionalAuth, getClaim);
router.post('/', createClaim); // students submit claims – no login needed
router.post('/:id/accept', requireDoss, accept);
router.post('/:id/reject', requireDoss, reject);

export default router;
