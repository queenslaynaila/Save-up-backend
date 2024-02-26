import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';
import { idSchema,ContributionSchema } from '../../types';
import { sql } from '../../db';

export default (router: Router) => {
  router.get('/:id', authMiddleware(), async (req, res) => {
    const validationResult = idSchema.safeParse(req.params.id);
    if (!validationResult.success) {
      throw new HttpError(400, 'Invalid contributions ID');
    }
    const id = validationResult.data;
    const query = 'SELECT * FROM contributions WHERE id = :id';
    const SQL_GET_CONTRIBUTION_BY_ID = sql<{ id: string },ContributionSchema>(query);
    const result = await SQL_GET_CONTRIBUTION_BY_ID({ id }).one();
    return res.json(result);
  });
};
