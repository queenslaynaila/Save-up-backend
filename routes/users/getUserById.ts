import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import pool from '../../db';

const userRouter = Router();

userRouter.get(
  '/:id',
  authMiddleware({ roles: [UserRole.ADMIN, UserRole.USER] }),
  async (req, res) => {
    const id = req.params.id;

    const authenticatedUserId = req.user?.id;
    if (authenticatedUserId !== id) {
      throw new HttpError(404, 'Not found');
    }

    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id, authenticatedUserId]);
    const user = result.rows[0];
    if (!user) {
      throw new HttpError(404, 'User with submitted ID not found');
    }

    res.json(user);
  }
);

export default () => userRouter;
