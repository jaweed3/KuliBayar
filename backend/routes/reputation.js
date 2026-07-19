import { Router } from 'express';
import {
  createProfileRecord,
  getProfileRecord,
  getProfileRecordByAddress,
} from '../services/store.js';

const router = Router();

// Create profile
router.post('/', async (req, res) => {
  try {
    const { role, name } = req.body;
    if (role === undefined) {
      return res.status(400).json({ error: 'Missing role (0=Worker, 1=Kontraktor)' });
    }
    const profileId = createProfileRecord(req.walletAddress, role, name || '');
    res.json({ success: true, profileId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get profile by ID
router.get('/:id', async (req, res) => {
  try {
    const profile = getProfileRecord(req.params.id);
    if (!profile) return res.json({ exists: false, id: '0' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get profile by address
router.get('/address/:address', async (req, res) => {
  try {
    const profileId = getProfileRecordByAddress(req.params.address);
    res.json({ profileId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
