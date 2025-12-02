import { Router } from 'express';

import {
  createMenuItem,
  deleteMenuItem,
  updateMenuItem,
} from '../controllers/menu.admin.controller.js';
import { requireAuth } from '../middlewares/require-auth.js';

const router = Router();

router.use(requireAuth);
router.post('/items', createMenuItem);
router.put('/items/:id', updateMenuItem);
router.delete('/items/:id', deleteMenuItem);

export const adminMenuRouter = router;
