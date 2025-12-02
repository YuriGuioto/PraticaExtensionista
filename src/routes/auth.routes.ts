import { Router } from 'express';

import { getProfile, login } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/require-auth.js';

const router = Router();

router.post('/login', login);
router.get('/me', requireAuth, getProfile);

export const authRouter = router;
