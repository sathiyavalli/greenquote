import jwt from 'jsonwebtoken';
import { logger } from '@/utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    logger.error('Token verification failed', error);
    return null;
  }
}
