// /api/items
import { Router } from 'express';
import { optionalAuth, requireDoss } from '../middleware/auth.js';
import {
  collectItem, createItem, deleteItem, getItem, listItems, resolveItem, updateItem,
} from '../controllers/itemController.js';

const router = Router();

router.get('/', optionalAuth, listItems); // everyone (DOSS also gets private details)
router.get('/:id', optionalAuth, getItem);
router.post('/', createItem); // students report items – no login needed
router.patch('/:id', requireDoss, updateItem);
router.delete('/:id', requireDoss, deleteItem);
router.post('/:id/collect', requireDoss, collectItem);
router.post('/:id/resolve', requireDoss, resolveItem);

export default router;
