import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Use env var if available, otherwise generate a random secret at startup.
// Note: A generated secret means sessions won't survive a restart, but login will work.
// For production, ALWAYS set JWT_SECRET in your environment variables.
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

export const signToken = (payload: any) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};
