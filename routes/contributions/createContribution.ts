import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { z } from 'zod';
import { contributionSchema, ContributionSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';

const SQL_CREATE_CONTRIBUTION = sql<z.infer<typeof contributionSchema>, ContributionSchema>(`
    INSERT INTO contributions (saving_id, amount, date)
    VALUES (:saving_id, :amount, :date)
    RETURNING *`);

export default (router: Router) => {
  router.post('/', authMiddleware(), async (req, res) => {
    const validationResult = contributionSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new HttpError(400, 'Invalid saving id, amount, or date');
    }
    const { saving_id, amount, date } = validationResult.data;
    const contributionResult = await SQL_CREATE_CONTRIBUTION({ saving_id, amount, date }).one();
    return res.json(contributionResult);
  });
};
