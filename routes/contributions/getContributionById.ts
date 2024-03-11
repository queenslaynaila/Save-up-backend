import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';
import { idSchema, ContributionSchema, UserRole } from '../../types';
import { sql } from '../../db';

const SQL_GET_CONTRIBUTION_BY_ID = (query: string) =>
  sql<{ id: string }, ContributionSchema>(query);

export default (router: Router) => {
  router.get<{ id: string }, ContributionSchema, Record<string, never>, Record<string, never>>(
    '/records/:contributionsId', 
    authMiddleware(), 
    async (req, res) => {
      const validationResult = idSchema.safeParse(req.params.id);
      if (!validationResult.success) {
        console.log('Validation error:', validationResult.error);
        throw new HttpError(400, 'Invalid contributions ID');
      }
      const contributionsId = validationResult.data;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      let query = 'SELECT * FROM contributions WHERE id = :id ';
      const values: { id: string; userId?: string } = { id: contributionsId };
      if (userRole !== UserRole.ADMIN) {
        query += `AND saving_id IN (SELECT id FROM savings WHERE user_id = :userId)`;
        values.userId = userId;
      }
  

      const result = await SQL_GET_CONTRIBUTION_BY_ID(query)(values).one(
        new HttpError(404, 'Contribution not found')
      );
      return res.json(result);
    });
};
