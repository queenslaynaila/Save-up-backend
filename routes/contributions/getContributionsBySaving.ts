import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { ContributionSchema } from '../../types';

export default (router: Router) => {
  router.get('/', authMiddleware(), async (req, res) => {
    const saving_id = req.query.saving_id as string;
    const page = parseInt(String(req.query.page || '1'));
    const pageSize = parseInt(String(req.query.pageSize || '10'));
    const offset = (page - 1) * pageSize;

    if (!saving_id) {
      throw new HttpError(400, 'Saving ID is required');
    }


    const query = 'SELECT * FROM contributions WHERE saving_id = :saving_id ORDER BY id OFFSET :offset LIMIT :limit';

    const SQL_GET_CONTRIBUTIONS = sql<{ saving_id: string; offset: number; limit: number },ContributionSchema>(query);
    const result = await SQL_GET_CONTRIBUTIONS({saving_id, offset, limit: pageSize }).many();
    return res.json(result);
  });
};
