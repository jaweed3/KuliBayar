import { Router } from 'express';
import {
  createProfile,
  createKuliProfile,
  getProfile,
  getProfileByAddress,
  isReliable,
  getOnTimeRate
} from '../services/blockchain.js';

const router = Router();

// Create profile
router.post('/', async (req, res) => {
  try {
    const { role, useKuliWallet } = req.body;

    if (role === undefined) {
      return res.status(400).json({ error: 'Missing role (0=Worker, 1=Kontraktor)' });
    }

    // Use separate wallet if specified (for demo: create kontraktor + kuli from different addresses)
    const profileId = useKuliWallet
      ? await createKuliProfile(role)
      : await createProfile(role);

    res.json({ success: true, profileId });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get profile by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await getProfile(id);
    res.json(profile);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get profile by address
router.get('/address/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const profileId = await getProfileByAddress(address);
    res.json({ profileId });
  } catch (error) {
    console.error('Error getting profile by address:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check reliability
router.get('/:id/reliable', async (req, res) => {
  try {
    const { id } = req.params;
    const reliable = await isReliable(id);
    res.json({ reliable });
  } catch (error) {
    console.error('Error checking reliability:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get on-time rate
router.get('/:id/onTimeRate', async (req, res) => {
  try {
    const { id } = req.params;
    const rate = await getOnTimeRate(id);
    res.json({ rate });
  } catch (error) {
    console.error('Error getting on-time rate:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
