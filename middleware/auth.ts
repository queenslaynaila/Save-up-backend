import  { NextFunction, Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { User } from '../types';

declare module 'express-serve-static-core' {
    interface Request {
      user?: User; 
    }
  }

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
      const token = req.headers['authorization'];
  
      if (!token) {
          return res.status(401).json({ message: "Token does not exist" });
      }
  
      const tokenValue = token.split(' ')[1];
      jwt.verify(tokenValue, process.env.JWT_SECRET as Secret, (err, decoded) => {
          if (err) {
              if (err.name === 'TokenExpiredError') {
                  return res.status(401).json({ message: 'Token expired,please log in again' });
              } else {
                  return res.status(401).json({ message: 'Invalid token,please log in again' });
              }
          }
          
          req.user = decoded as User;
          next();
      });
  };
  
  export default authenticateToken;
  