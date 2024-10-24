import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { HttpError } from './errorMiddleware';

type Schemas = {
  [key in 'body' | 'query' | 'params']?: ZodSchema;
};

const validateSchema = (schema: ZodSchema, data: unknown, part: string) => {
  const validationResult = schema.safeParse(data);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map((err) => ({
      location: part,
      path: err.path.join('.'),
      msg: err.message,
      code: err.code
    }));

    throw new HttpError(400, errors);
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