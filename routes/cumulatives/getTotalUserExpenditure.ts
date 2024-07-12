import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { TotalExpenseInterface, 
  TotalExpenseQueryInterface, 
  UserCumulaInterface 
} from './types'
import { headersSchema } from '../../globalTypes';
import validateRequest from '../../middleware/validationMiddleware';

const SQL_GET_TOTAL_EXPENSES = sql<UserCumulaInterface, TotalExpenseInterface>(`
  SELECT COALESCE(SUM(amount_spent), 0) AS total_expenses
  FROM expenses
  WHERE entity_id = :user_id
`);

export default (router: Router) => {
  router.get<Record<string,never>, TotalExpenseInterface, Record<string,never>, 
  TotalExpenseQueryInterface>(
    '/total-expenses', 
    validateRequest({
      headers: headersSchema
    }), 
    authMiddleware(), 
    async (req, res) => {
      const user_id = req.user!.id;
      const {  start_date, end_date, category_id } = req.query;
      const filters: string[] = [];
      const filterArgs: Record<string, string> = {};
      if (start_date) {
        filterArgs.start_date = start_date;
        filters.push(`date >= :start_date`);
      }
      if (end_date) {
        filterArgs.end_date = end_date;
        filters.push(`date <= :end_date`);
      }
      if (category_id){
        filterArgs.category_id = category_id;
        filters.push(`category_id = :categoryId`);
      }
      const query = SQL_GET_TOTAL_EXPENSES({user_id });
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      res.json(await query.one( new HttpError(500)));
    });
};
