import authMiddleware from '../../middleware/auth';
import { hasPermission } from '../../middleware/hasPermission';
import { Router } from 'express';
import { HttpError } from '../../middleware/errorMiddleware';
import { savingInterface } from './index';
import { sql } from '../../db';
import { idSchema } from '../../types';

export default (router: Router) => {
  router.get('/:id',authMiddleware(), async (req, res) => {
    const validationResult = idSchema.safeParse(req.params.id);
    if (!validationResult.success) {
      throw new HttpError(400, 'Invalid saving ID');
    }

    const id = validationResult.data;
    const userId = req.user!.id;
    const loggedInUserRole = req.user!.role;
    if (!hasPermission(req, userId,  loggedInUserRole)) {
      throw new HttpError(403, 'Unauthorized access');
    }
 
    const query = `SELECT * FROM savings WHERE id = :id AND user_id = :user_id`;
    const SQL_GET_SAVING_BY_ID = sql<{ id: string }, savingInterface>(
      query
    );
    const saving = await SQL_GET_SAVING_BY_ID({ id }).one(new HttpError(404, 'Saving not found'));
    res.json(saving);
  });
};
