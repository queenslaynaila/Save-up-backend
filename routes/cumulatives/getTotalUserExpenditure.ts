import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { GetTotalExpenseInterface, GetTotalExpenseQueryInterface, GetUserCumulaInterface } from './types'

const SQL_GET_TOTAL_EXPENSES = sql<GetUserCumulaInterface, GetTotalExpenseInterface>(`
  SELECT COALESCE(SUM(amount_spent), 0) AS total_expenses
  FROM expenses
  WHERE entity_id = :userId
`);

export default (router: Router) => {
  router.get<Record<string,never>, GetTotalExpenseInterface, Record<string,never>, GetTotalExpenseQueryInterface>(
    '/total-expenses', 
    authMiddleware(), 
    async (req, res) => {
      const userId = req.user!.id;
      const { startDate, endDate, categoryId } = req.query;
      const filters: string[] = [];
      const filterArgs: Record<string, string> = {};
      
      if (startDate) {
        filterArgs.startDate = startDate;
        filters.push(`date >= :startDate`);
      }
      if (endDate) {
        filterArgs.endDate = endDate;
        filters.push(`date <= :endDate`);
      }
      if (categoryId){
        filterArgs.categoryId = categoryId;
        filters.push(`category_id = :categoryId`);
      }

      const query = SQL_GET_TOTAL_EXPENSES({userId });
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      
      res.json(await query.one( new HttpError(500, 'An error occurred while processing your request. Please try again later.')));

    });
};
