import { z } from 'zod';
import User from '../models/User.js';
import { generateToken, setTokenCookie } from '../utils/token.js';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['student', 'faculty']),
  college: z.string().min(2),
  department: z.string().min(2),
  semester: z.number().min(1).max(8).optional(),
  rollNo: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await User.findOne({ email: data.email });
    if (existing) return res.status(409).json({ error: 'Email already in use' });
    const user = await User.create(data);
    const token = generateToken(user._id);
    setTokenCookie(res, token);
    res.status(201).json({ user: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid credentials' });
    const token = generateToken(user._id);
    setTokenCookie(res, token);
    res.json({ user: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

export function logout(req, res) {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
}

export function me(req, res) {
  res.json({ user: sanitize(req.user) });
}

function sanitize(user) {
  const { _id, name, email, role, college, department, semester, rollNo, profilePicture, createdAt } = user;
  return { _id, name, email, role, college, department, semester, rollNo, profilePicture, createdAt };
}
