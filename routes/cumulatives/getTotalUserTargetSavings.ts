import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';


const SQL_GET_TOTAL_TARGET_AMOUNT = sql<{ [key: string]: string },{ total_target_amount: number }>(`
    SELECT COALESCE(SUM(amount), 0) AS total_target_amount
    FROM savings
`);

export default (router: Router) => {
  router.get<Record<string, string>, { total_target_amount: number }, Record<string, string>, {priority?: string;status?: string;category_id?: string;}>(
    '/total-target-amount', 
    authMiddleware(), 
    async (req, res) => {
      const userId = req.user!.id;
      const filters: string[] = [];
      const filterArgs: Record<string, string> = {};
      const { priority, status, category_id } = req.query 
      const values: Record<string, number> = { userId };
  
      if (priority) {
        filterArgs.priority = priority;
        filters.push('priority = :priority');
      }
      if (status) {
        filterArgs.status = status;
        filters.push ('status = :status');
      }
      if (category_id) {
        filterArgs.category_id = category_id;
        filters.push ('category_id = :category_id')
      }
      const query = SQL_GET_TOTAL_TARGET_AMOUNT({});
      if (filters.length > 0) query.extend(`WHERE ${filters.join(' AND ')}`, filterArgs);
      query.extend('WHERE user_id = :userId', values);
      res.json(await query.one());
    }
  );
  
};
