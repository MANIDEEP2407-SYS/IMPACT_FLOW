import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function authMiddleware(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ error: 'User not found' });
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function roleGuard(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role))
      return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
