import { Router } from 'express';
import { reviewCode } from '../controllers/reviewController';

const router = Router();

router.post('/', reviewCode);

export { router as reviewRouter };