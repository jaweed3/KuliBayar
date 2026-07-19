import { Router } from 'express';
import { getDisputeHistory } from '../services/store.js';

const router = Router();

router.get('/history', async (req, res) => {
  try {
    const data = getDisputeHistory(req.walletAddress);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
