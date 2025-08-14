import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { sql } from './db';
import HttpError from './httpError';
import Config from './config';
import {
  AuthenticatedUser,
  PinResetState,
  Role
} from './routes/users/schema';
import { StringValue } from 'ms';

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
    resetState?: PinResetState;
  }
}

const SQL_GET_USER_PIN = sql<
{ user_id: number },
{ pin: string }
>(`
  SELECT pin 
  FROM users 
  WHERE id = :user_id
`);

export function generateToken(
  userId: number,
  expiresIn: StringValue | number,
  roleOrStep: Role | number,
  isAccessToken = false
): string {
  const payload: { id: number; role?: Role; step?: number } = { id: userId };

  if (typeof roleOrStep === 'number') {
    payload.step = roleOrStep;
  } else {
    payload.role = roleOrStep;
  }

  const secret = isAccessToken
    ? Config.JWT_SECRET
    : Config.JWT_REFRESH_SECRET;

  const options = {
    expiresIn,
    issuer: Config.JWT_ISSUER
  };

  return jwt.sign(payload, secret, options);
}

export function validateAndDecodeJwt(
  headerValue: string,
  isRefreshToken = false
): JwtPayload {
  const parts = headerValue.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new HttpError(400);
  }
  const token = parts[1];

   const secret = isRefreshToken
    ? Config.JWT_REFRESH_SECRET
    : Config.JWT_SECRET;

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    if (!decoded || !decoded.id) {
      throw new HttpError(401);
    }
    return decoded;
  } catch {
    throw new HttpError(401);
  }
}

export function checkResetTokenValidity(requiredStep: number) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const resetToken = req.headers.reset as string;
    const decoded = validateAndDecodeJwt(resetToken);

    if (!decoded.id || !decoded.step) {
      throw new HttpError(401);
    }

    req.resetState = { userId: decoded.id, step: decoded.step };

    if (req.resetState.step !== requiredStep) {
      throw new HttpError(403);
    }

    next();
  };
}

export async function verifyPin(req: Request, _res: Response, next: NextFunction) {
  if (!req.body.pin) {
    throw new HttpError(400);
  }

  if (!req.user) {
    throw new HttpError(401);
  }

  const { pin: hashedPin } = await SQL_GET_USER_PIN({
    user_id: req.user!.id
  }).one();

  const isPinValid = await bcrypt.compare(req.body.pin, hashedPin);
  if (!isPinValid) {
    throw new HttpError(401);
  }

  next();
}