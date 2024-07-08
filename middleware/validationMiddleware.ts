import { HttpError } from '../middleware/errorMiddleware';
import { NextFunction, Request, Response } from 'express';
import { ZodSchema  } from 'zod';

export function validateRequest  (schema:ZodSchema)  {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationResult = schema.safeParse(req.body);
    if (!validationResult.success) {
      throw new HttpError(
        422, 
        { field: validationResult.error.errors[0].path[0]}
      );
    }
    next(); 
  };
}