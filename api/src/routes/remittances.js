import { Router } from 'express';
import { listRemittances, getRemittance, createRemittance, updateRemittance, deleteRemittance } from '../controllers/remittances.js';

const router = Router();

router.get('/', listRemittances);
router.get('/:id', getRemittance);
router.post('/', createRemittance);
router.patch('/:id', updateRemittance);
router.delete('/:id', deleteRemittance);

export default router;