import { Router } from 'express';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/auth'; 
import { idSchema } from '../../types';
import { sql } from '../../db';
import { UserSchema } from './index';

export default (router: Router) => {
  router.get(
    '/:id',
    authMiddleware(), 
    //validate(),
    async (req, res) => {
      const validationResult = idSchema.safeParse(req.params.id);
      if (!validationResult.success) {
        throw new HttpError(400, 'Invalid user data');
      }
      const authenticatedUserId = req.user?.id;
      const id = validationResult.data;
      if (authenticatedUserId !== id) {
        throw new HttpError(404, 'Resource Not found');
      }
      const SQL_GET_USER_BY_ID = sql<{ id: string }, UserSchema>(
        `SELECT * FROM users WHERE id = :id`
      );
      const user = await SQL_GET_USER_BY_ID({ id }).one();
      if (!user) {
        throw new HttpError(404, 'User not found');
      }
      res.json(user);
    }
  );
};
