import {  NextFunction, Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { HttpError } from './errorMiddleware';
import { UserRole } from '../types/index';

type User = {
  id: number;
  role: UserRole;
}

export const verifyResetToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['x-reset-token'] as string;
  if (!token) {
    throw new HttpError(403, 'Access denied');
  }
  const resetTokenValue = token.split(' ')[1];
  jwt.verify(resetTokenValue, process.env.JWT_SECRET as Secret, (err, decodedResetToken) => {
    if (err) {
      next(err); 
    } else {
      console.log('Token decoded:', decodedResetToken);
      const user = decodedResetToken as User;
      req.user = user;
      next();
    }
  });
};