import { SiweMessage, generateNonce } from 'siwe';
import { getProfileByAddress, getProfile } from '../services/blockchain.js';

// In-memory nonce store with cleanup
const nonces = new Map();
const NONCE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_NONCES = 10000; // Prevent memory exhaustion
const CLEANUP_INTERVAL = 60000; // Clean up every minute

// Periodic cleanup to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of nonces.entries()) {
    if (value.expiresAt < now) {
      nonces.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

export function createNonce(address) {
  const nonce = generateNonce();
  const key = address.toLowerCase();
  
  // Enforce max size - remove oldest if at limit
  if (nonces.size >= MAX_NONCES) {
    const oldestKey = nonces.keys().next().value;
    nonces.delete(oldestKey);
  }
  
  nonces.set(key, { nonce, expiresAt: Date.now() + NONCE_TTL });
  return nonce;
}

export function verifySiwe(address, signature, nonce, domain) {
  const key = address.toLowerCase();
  const stored = nonces.get(key);
  
  if (!stored) {
    return { ok: false, error: 'Nonce expired or invalid' };
  }
  
  if (stored.expiresAt < Date.now()) {
    nonces.delete(key);
    return { ok: false, error: 'Nonce expired' };
  }
  
  if (stored.nonce !== nonce) {
    return { ok: false, error: 'Invalid nonce' };
  }
  
  nonces.delete(key);

  const msg = new SiweMessage({
    domain,
    address,
    statement: 'Sign in to KuliBayar',
    version: '1',
    chainId: parseInt(process.env.CHAIN_ID || '97'),
    nonce,
  });

  try {
    const result = msg.verify({ signature });
    return { ok: true, address: result.data.address };
  } catch {
    return { ok: false, error: 'Invalid signature' };
  }
}

// Lightweight: header-only. Contract msg.sender is the real auth.
export function requireWallet(req, res, next) {
  const addr = req.headers['x-wallet-address'];
  if (!addr) return res.status(401).json({ error: 'Wallet address required' });
  req.walletAddress = addr.toLowerCase();
  next();
}

// Full SIWE verification for sensitive writes
export function requireSiwe(req, res, next) {
  const addr = req.headers['x-wallet-address'];
  const sig = req.headers['x-wallet-signature'];
  const nonce = req.headers['x-auth-nonce'];
  if (!addr || !sig || !nonce) return res.status(401).json({ error: 'SIWE authentication required' });

  const result = verifySiwe(addr, sig, nonce, req.headers['x-auth-domain'] || req.hostname);
  if (!result.ok) return res.status(401).json({ error: result.error });
  req.walletAddress = result.address.toLowerCase();
  next();
}

// Fetch on-chain role: 0 = Kuli, 1 = Kontraktor
export function requireRole(...allowed) {
  return async (req, res, next) => {
    try {
      const profileId = await getProfileByAddress(req.walletAddress);
      if (!profileId || profileId === '0') {
        return res.status(403).json({ error: 'No profile. Create one first.' });
      }
      const profile = await getProfile(profileId);
      req.profileId = profileId;
      req.userRole = parseInt(profile.role);
      if (allowed.length && !allowed.includes(req.userRole)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      next();
    } catch (e) {
      next(e);
    }
  };
}
