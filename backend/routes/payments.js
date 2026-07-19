import { Router } from 'express';
import { getPayments } from '../services/store.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const data = getPayments(req.walletAddress);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
