import { NextFunction, Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { HttpError } from './errorMiddleware';
import { User } from './authorization';

export const authenticateResetToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.reset as string;
  if (!token) {
    throw new HttpError(403);
  }
  const resetTokenValue = token.split(' ')[1];

  jwt.verify(resetTokenValue, process.env.JWT_SECRET as Secret, (err, decodedResetToken) => {
    if (err) {
      throw new HttpError(403);
    } else {
      const user = decodedResetToken as User;
      req.user = user;
      next();
    }
  });
};