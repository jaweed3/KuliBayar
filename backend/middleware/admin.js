export function requireAdmin(req, res, next) {
  const adminAddress = process.env.ADMIN_ADDRESS;
  if (!adminAddress) {
    return res.status(403).json({ error: 'Admin not configured (ADMIN_ADDRESS env)' });
  }
  if (req.walletAddress !== adminAddress) {
    return res.status(403).json({ error: 'Not authorized as admin' });
  }
  next();
}
