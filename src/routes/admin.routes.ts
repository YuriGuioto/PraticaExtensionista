import { Router } from 'express';

import { healthCheck } from '../controllers/admin.controller.js';

const router = Router();

router.get('/health', healthCheck);

export const adminRouter = router;
