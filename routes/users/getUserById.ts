import { Router } from 'express';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/auth';
import { hasPermission } from '../../middleware/hasPermission';
import { idSchema } from '../../types';
import { sql } from '../../db';
import { UserSchema } from './index';

const SQL_GET_USER_BY_ID = sql<{ userId: string }, UserSchema>(
  `SELECT id, first_name, last_name, phone_number, role, created_at, updated_at FROM users  WHERE id = :id`
);

export default (router: Router) => {
  router.get('/:id', authMiddleware(), async (req, res) => {
    const validationResult = idSchema.safeParse(req.params.id);
    if (!validationResult.success) {
      throw new HttpError(400, 'Invalid data');
    }

    const userId = validationResult.data;
    const loggedInUserRole = req.user!.role;
    if (!hasPermission(req, userId, loggedInUserRole)) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const user = await SQL_GET_USER_BY_ID({ userId }).one(new HttpError(404, 'User not found'));
    res.json(user);
  });
};
