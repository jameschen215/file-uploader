import { Router } from 'express';
import { getHomepage } from '../controllers';
import { isAuthenticated } from '../auth';

const router = Router();

router.get('/', isAuthenticated, getHomepage);

export default router;
