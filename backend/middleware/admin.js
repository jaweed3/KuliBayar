export function requireAdmin(req, res, next) {
  const adminAddress = (process.env.ADMIN_ADDRESS || '').toLowerCase();
  if (!adminAddress) {
    return res.status(403).json({ error: 'Admin not configured (ADMIN_ADDRESS env)' });
  }
  if ((req.walletAddress || '').toLowerCase() !== adminAddress) {
    return res.status(403).json({ error: 'Not authorized as admin' });
  }
  next();
}
