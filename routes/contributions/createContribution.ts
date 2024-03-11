import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { contributionSchema, ContributionSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';

interface ContributionCreation {
  saving_id: string;
  amount: number;
  date: string;
}

const SQL_CREATE_CONTRIBUTION = sql<ContributionCreation, ContributionSchema>(`
    INSERT INTO contributions (saving_id, amount, date)
    VALUES (:saving_id, :amount, :date)
    RETURNING *
`);

export default (router: Router) => {
  router.post<Record<string, never>,ContributionSchema,ContributionCreation,Record<string, never>,Record<string, never>>(
    '/', 
    authMiddleware(), 
    async (req, res) => {
      const validationResult = contributionSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new HttpError(400, 'Invalid saving id, amount, or date');
      }
      const { saving_id, amount, date } = validationResult.data;
      const contributionResult = await SQL_CREATE_CONTRIBUTION({ saving_id, amount, date }).one();
      return res.json(contributionResult);
    });
};
