import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';
import { idSchema } from '../../types';
import pool from '../../db';

const userRouter = Router();

userRouter.get('/:id', authMiddleware(), async (req, res) => {
  const validationResult = idSchema.safeParse(req.params.id);
  if (!validationResult.success) {
    throw new HttpError(400, 'Invalid expense ID');
  }
  const authenticatedUserId = req.user?.id;
  const id = validationResult.data;
  if (authenticatedUserId !== id) {
    throw new HttpError(404, 'Not found');
  }
  const query = 'SELECT * FROM users WHERE id = $1';
  const result = await pool.query(query, [id]);
  const user = result.rows[0];
  if (!user) {
    throw new HttpError(404, 'User with submitted ID not found');
  }
  res.json(user);
});

export default () => userRouter;
