import { Router } from 'express';

import { adminRouter } from './admin.routes.js';
import { adminMenuRouter } from './menu-admin.routes.js';
import { authRouter } from './auth.routes.js';
import { menuRouter } from './menu.routes.js';
import { orderRouter } from './order.routes.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/menu', menuRouter);
router.use('/orders', orderRouter);
router.use('/admin/menu', adminMenuRouter);
router.use('/', adminRouter);

export const apiRouter = router;
