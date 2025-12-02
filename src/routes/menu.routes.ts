import { Router } from 'express';

import { getCategories, getItemById, getItems } from '../controllers/menu.controller.js';

const router = Router();

router.get('/categories', getCategories);
router.get('/items', getItems);
router.get('/items/:id', getItemById);

export const menuRouter = router;
