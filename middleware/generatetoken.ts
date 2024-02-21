import jwt, { Secret } from 'jsonwebtoken';
import { UserRole } from '../types/index';

export const generateToken = (id: string, role: UserRole): string => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as Secret, { expiresIn: '1h' });
};
