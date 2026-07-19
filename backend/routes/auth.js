import { Router } from 'express';
import { createNonce, verifySiwe } from '../middleware/auth.js';
import { getProfileRecordByAddress, getProfileRecord } from '../services/store.js';

const router = Router();

router.post('/nonce', (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: 'Missing address' });
  const nonce = createNonce(address);
  res.json({ nonce });
});

router.post('/verify', async (req, res) => {
  const { address, signature, nonce, domain } = req.body;
  if (!address || !signature || !nonce) {
    return res.status(400).json({ error: 'Missing address, signature, or nonce' });
  }

  const result = verifySiwe(address, signature, nonce, domain || req.hostname);
  if (!result.ok) return res.status(401).json({ error: result.error });

  let role = null;
  let profileId = null;
  try {
    profileId = getProfileRecordByAddress(result.address);
    if (profileId && profileId !== '0') {
      const profile = getProfileRecord(profileId);
      if (profile) role = parseInt(profile.role);
    }
  } catch {
    // No profile yet
  }

  res.json({ address: result.address, role, profileId });
});

export default router;
