import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';

export default (router: Router) => {
  router.get('/completed-savings', authMiddleware(), async (req, res) => {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const status = req.query.status as string;

    const allowedStatusValues = ['In Progress', 'Dormant', 'Completed'];
    if (!allowedStatusValues.includes(status)) {
      throw new HttpError(400, 'Invalid status value. Status must be one of: In Progress, Dormant, Completed');
    }

    const SQL_GET_COMPLETED_SAVINGS = sql<{ startDate: string; endDate: string,status:string }, { completedSavingsCount: number }>(`
      SELECT COUNT(*) AS completedSavingsCount
      FROM savings
      WHERE  completed_date BETWEEN :startDate AND :endDate
      AND status = :status;
    `);

    const result = await SQL_GET_COMPLETED_SAVINGS({ startDate, endDate,status }).one();
    res.json(result);
  });
};
