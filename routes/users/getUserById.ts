import { Router } from 'express';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/auth';
import { idSchema } from '../../types';
import { sql } from '../../db';
import { UserSchema } from './index';

export default (router: Router) => {
  router.get('/:id', authMiddleware(), async (req, res) => {
    const validationResult = idSchema.safeParse(req.params.id);
    if (!validationResult.success) {
      throw new HttpError(400, 'Invalid user data');
    }

    const authenticatedUserId = req.user?.id;
    const id = validationResult.data;
    if (authenticatedUserId !== id) {
      throw new HttpError(404, 'Resource Not found');
    }

    const query = `SELECT id, first_name, last_name, phone_number, role, created_at, updated_at FROM users  WHERE id = :id`
    const SQL_GET_USER_BY_ID = sql<{ id: string }, UserSchema>( query );
    const user = await SQL_GET_USER_BY_ID({ id }).one(new HttpError(404, 'User not found'));
    res.json(user);
  });
};
