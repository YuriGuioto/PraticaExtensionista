import { Router } from 'express';

import {
  createOrder,
  getOrder,
  listOrders,
  updateOrderStatus,
} from '../controllers/order.controller.js';
import { requireAuth } from '../middlewares/require-auth.js';

const router = Router();

router.post('/', createOrder);

router.get('/', requireAuth, listOrders);
router.get('/:id', requireAuth, getOrder);
router.patch('/:id/status', requireAuth, updateOrderStatus);

export const orderRouter = router;
