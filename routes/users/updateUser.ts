import { Router } from 'express';
import { z } from 'zod';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { hasPermission } from '../../middleware/hasPermission';
import { UpdateUserSchema } from '../../types';
import { UserSchema } from './index';
import { HttpError } from '../../middleware/errorMiddleware';

const SQL_UPDATE_USER = sql<z.infer<typeof UpdateUserSchema>& { id:number }, UserSchema>(`
  UPDATE users
  SET first_name = COALESCE(:first_name, users.first_name),
      last_name = COALESCE(:last_name, users.last_name)
  WHERE id = :id
  RETURNING *
`);

export default (router: Router) => {
  router.patch<{ id: string },UserSchema,z.infer<typeof UpdateUserSchema>,Record<string, never>>(
    '/:id', 
    authMiddleware(), 
    async (req, res) => {
      const userId = parseInt(req.params.id);
      if (!hasPermission(req, userId)) {
        throw new HttpError(403, 'Unauthorized');
      }
      console.log(req.user)

      const validationResult = UpdateUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new HttpError(
          422,
          'Invalid user data. Please provide valid values for all user fields.'
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
