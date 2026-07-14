import { Router } from 'express';
import { createNonce, verifySiwe } from '../middleware/auth.js';
import { getProfileByAddress, getProfile } from '../services/blockchain.js';

const router = Router();

// Get nonce for SIWE signing
router.post('/nonce', (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: 'Missing address' });
  const nonce = createNonce(address);
  res.json({ nonce });
});

// Verify SIWE signature, return wallet + role
router.post('/verify', async (req, res) => {
  const { address, signature, nonce, domain } = req.body;
  if (!address || !signature || !nonce) {
    return res.status(400).json({ error: 'Missing address, signature, or nonce' });
  }

  const result = verifySiwe(address, signature, nonce, domain || req.hostname);
  if (!result.ok) return res.status(401).json({ error: result.error });

  // Lookup on-chain role
  let role = null;
  let profileId = null;
  try {
    profileId = await getProfileByAddress(result.address);
    if (profileId && profileId !== '0') {
      const profile = await getProfile(profileId);
      role = parseInt(profile.role); // 0=Kuli, 1=Kontraktor
    }
  } catch {
    // No profile yet — that's fine, role stays null
  }

  res.json({ address: result.address, role, profileId });
});

export default router;
