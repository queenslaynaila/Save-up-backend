import jwt, { Secret } from 'jsonwebtoken';
import { UserRole } from '../globalTypes';

export const ISSUER = 'saveup';
export const generateToken = (id: number, role: UserRole, expiresIn: string): string => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as Secret, { expiresIn, issuer: ISSUER });
};