import { HttpError } from '../middleware/errorMiddleware';
import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodSchema  } from 'zod';

export function validateRequest(schema: ZodSchema) {
  return async (request: FastifyRequest, reply: FastifyReply, next: () => void) => {
    const validationResult = schema.safeParse(request.body);
    if (!validationResult.success) {
      throw new HttpError(422, 'Unprocessable Entity'); 
    }
    next();
  };
}