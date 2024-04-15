import jwt, { Secret } from 'jsonwebtoken';
import { UserRole } from '../types/index';

export const generateToken = (id: number, role: UserRole, expiresIn: string): string => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as Secret, { expiresIn });
};

export const verifyTokenExpiration = (token: string): boolean => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as Secret);
    const { exp } = decoded as { exp: number };
    return exp * 1000 > Date.now();
  } catch (error) {
    return true;
  }
};
