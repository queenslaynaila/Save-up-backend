import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { contributionSchema, ContributionSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';

type ContributionCreation = Omit<ContributionSchema, 'created_at' | 'updated_at'>

const SQL_CREATE_CONTRIBUTION = sql<ContributionCreation, ContributionSchema>(`
    INSERT INTO contributions (user_id,saving_id, amount, date)
    VALUES (:user_id,:saving_id,:amount, :date)
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
      console.log(`this is logged in ${req.user!.id}` )
      const user_id= req.user!.id
      const { saving_id, amount, date } = validationResult.data;
      console.log(user_id,saving_id, amount, date)
      const contributionResult = await SQL_CREATE_CONTRIBUTION({ user_id,saving_id, amount, date }).one();
      return res.json(contributionResult);
    });
};
