import { Router } from 'express';
import { getExchangeRate } from '../controllers/external.js';

const router = Router();

router.get('/exchange-rates', getExchangeRate);

export default router; 