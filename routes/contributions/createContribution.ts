import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { contributionSchema, ContributionSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';

type ContributionCreation = Omit<ContributionSchema, 'created_at' | 'updated_at'>

const SQL_CREATE_CONTRIBUTION = sql<ContributionCreation, ContributionSchema>(`
    INSERT INTO contributions (id,user_id,saving_id, amount, date)
    SELECT COALESCE((SELECT MAX(id) FROM contributions WHERE user_id = :user_id), 0) + 1,
    :user_id,:saving_id,:amount, :date
    RETURNING *
`);

export default (router: Router) => {
  router.post<Record<string, never>,ContributionSchema,ContributionCreation,Record<string, never>,Record<string, never>>(
    '/', 
    authMiddleware(), 
    async (req, res) => {
      const validationResult = contributionSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new HttpError(422, 'Unprocessable Entity');
      }
      const user_id= req.user!.id
      const { saving_id, amount, date } = validationResult.data;
      const contributionResult = await SQL_CREATE_CONTRIBUTION({ user_id,saving_id, amount, date }).one(new HttpError(404, 'Unable to complete the request'));
      return res.json(contributionResult);
    });
};
