import jwt, { Secret } from 'jsonwebtoken';

export const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as Secret, { expiresIn: '1h' });
};
