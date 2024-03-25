import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { HttpError } from '../../middleware/errorMiddleware';
import { savingInterface } from './index';
import { sql } from '../../db';
import { ID_SCHEMA,UserRole } from '../../types';


const SQL_GET_SAVING_BY_ID = sql<{ id: number; userId?: number }, savingInterface>(`
    SELECT * FROM savings WHERE id = :id
`);

export default (router: Router) => {
  router.get<{ savingId: string }, savingInterface, Record<string, never>, Record<string, never>>(
    '/records/:savingId', 
    authMiddleware(), 
    async (req, res) => {
      const idValidationResult = ID_SCHEMA.safeParse(parseInt(req.params.savingId));
      if (!idValidationResult.success) {
        throw new HttpError(400, 'Invalid request');
      }

      const savingId = idValidationResult.data;
      const loggedInUserId = req.user!.id;
      const userRole = req.user!.role;

      const query = SQL_GET_SAVING_BY_ID({ id: savingId });
      if (userRole !== UserRole.ADMIN) {
        query.extend('AND user_id = :userId', { userId: loggedInUserId });
      }
      const saving = await query.one(new HttpError(404, 'Saving not found'));
      return res.json(saving);
    });
};
