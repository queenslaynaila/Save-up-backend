import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { HttpError } from '../../middleware/errorMiddleware';
import { savingInterface } from './index';
import { sql } from '../../db';
import { idSchema, UserRole } from '../../types';

let savingQuery = `SELECT * FROM savings WHERE id = :id`;
const SQL_GET_SAVING_BY_ID = sql<{ id: string; userId?: string }, savingInterface>(savingQuery);

export default (router: Router) => {
  router.get('/:id', authMiddleware(), async (req, res) => {
    const idValidationResult = idSchema.safeParse(req.params.id);
    if (!idValidationResult.success) {
      throw new HttpError(400, 'Invalid saving ID');
    }

    const savingId = idValidationResult.data;
    const loggedInUserId = req.user!.id;
    const userRole = req.user!.role;

    const queryValues: { id: string; userId?: string } = { id: savingId };
    if (userRole !== UserRole.ADMIN) {
      savingQuery += ' AND user_id = :userId';
      queryValues.userId = loggedInUserId;
    }
    const saving = await SQL_GET_SAVING_BY_ID(queryValues).one(
      new HttpError(404, 'Saving not found')
    );
    return res.json(saving);
  });
};
