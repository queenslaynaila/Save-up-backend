import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { HttpError } from '../../middleware/errorMiddleware';
import { savingInterface } from './index';
import { sql } from '../../db';
import { idSchema,UserRole } from '../../types';

export default (router: Router) => {
  router.get('/:id', authMiddleware(), async (req, res) => {

    const validationResult = idSchema.safeParse(req.params.id);
    if (!validationResult.success) {
      throw new HttpError(400, 'Invalid saving ID');
    }

    const id = validationResult.data;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const query = `SELECT * FROM savings WHERE id = :id `;
    const SQL_GET_SAVING_BY_ID = sql<{ id: string }, savingInterface>(query);
    const saving = await SQL_GET_SAVING_BY_ID({ id }).one();
    if (userRole !== UserRole.ADMIN && saving.user_id !== userId) {
      throw new HttpError(403, 'Unauthorized access');
    }
    return res.json(saving);
    
  });
};

