import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { HttpError } from '../../middleware/errorMiddleware';
import { savingInterface } from './index';
import { sql } from '../../db';
import { idSchema, UserRole } from '../../types';

let savingQuery = `SELECT * FROM savings WHERE id = :id`;
const SQL_GET_SAVING_BY_ID = sql<{ id: number; userId?: number }, savingInterface>(savingQuery);

export default (router: Router) => {
  router.get<{ savingId: string }, savingInterface, Record<string, never>, Record<string, never>>(
    '/records/:savingId', 
    authMiddleware(), 
    async (req, res) => {
      const idValidationResult = idSchema.safeParse(parseInt(req.params.savingId));
      if (!idValidationResult.success) {
        throw new HttpError(400, 'Invalid saving ID');
      }

      const savingId = idValidationResult.data;
      const loggedInUserId = req.user!.id;
      const userRole = req.user!.role;

      const queryValues: { id: number; userId?: number } = { id: savingId };
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
