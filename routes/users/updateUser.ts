import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { hasPermission } from '../../middleware/hasPermission';
import { UpdateUserSchema } from '../../types';
import { UserSchema } from './index';
import { HttpError } from '../../middleware/errorMiddleware';

interface UpdateUserSchema {
  first_name: string | undefined;
  last_name: string | undefined;
  id:number;
}

const SQL_UPDATE_USER = sql<UpdateUserSchema, UserSchema>(`
  UPDATE users
  SET first_name = COALESCE(:first_name, users.first_name),
      last_name = COALESCE(:last_name, users.last_name)
  WHERE id = :id
  RETURNING *
`);

export default (router: Router) => {
  router.patch<{ id: string },UserSchema,UpdateUserSchema,Record<string, never>>(
    '/:id', 
    authMiddleware(), 
    async (req, res) => {
      const userId = parseInt(req.params.id);
      if (!hasPermission(req, userId)) {
        throw new HttpError(403, 'Forbidden');
      }
      const validationResult = UpdateUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new HttpError(
          403,
          'Unprocessable Entity'
        );
      }
      const { first_name, last_name } = validationResult.data;

      const result = await SQL_UPDATE_USER({
        id: userId ,
        first_name: first_name,
        last_name : last_name  
      }).one();
      
      res.json(result);
    });
};
