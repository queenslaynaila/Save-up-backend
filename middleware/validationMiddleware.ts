import { HttpError } from '../middleware/errorMiddleware';
import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

type Schemas = {
  [key in 'body' | 'query' | 'params' ]?: ZodSchema;
}; 

const validateSchema = (schema: ZodSchema, data: unknown, part: string) => {
  const validationResult = schema.safeParse(data);
  if (!validationResult.success) {
    const validation = validationResult.error.errors.map((err) => ({
      in: part,
      field: err.path.join('.'),
      message: err.message
    }));
    throw new HttpError(422, { validation }); 
  }
};

export default function validateRequest(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (schemas.params) validateSchema(schemas.params, req.params, 'params');
    if (schemas.body) validateSchema(schemas.body, req.body, 'body');
    if (schemas.query) validateSchema(schemas.query, req.query, 'query');
    next();
  };
}

