import { Router } from 'express';
import { isAuthenticated } from '../auth/middlewares.js';
import { handleSearch } from '../controllers/search.controller.js';

const router = Router();

router.get('/', isAuthenticated, handleSearch);

export default router;
