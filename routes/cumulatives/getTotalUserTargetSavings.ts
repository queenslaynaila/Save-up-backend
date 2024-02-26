import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';

export default (router: Router) => {
  router.get('/total-target-amount', authMiddleware(), async (req, res) => {
    const userId = req.user!.id;
    const { priority, status, category_id } = req.query as {
      priority?: string;
      status?: string;
      category_id?: string;
    };

    let condition = 'user_id = :userId';
    const values: { [key: string]: string } = { userId };

    if (priority) {
      condition += ' AND priority = :priority';
      values.priority = priority;
    }

    if (status) {
      condition += ' AND status = :status';
      values.status = status;
    }

    if (category_id) {
      condition += ' AND category_id = :category_id';
      values.category_id = category_id;
    }

    const query = `
        SELECT COALESCE(SUM(target_amount), 0) AS total_target_amount
        FROM savings
        WHERE ${condition}`;

    const SQL_GET_TOTAL_TARGET_AMOUNT = sql<{ [key: string]: string }, { total_target_amount: number }>(query);
    const result = await SQL_GET_TOTAL_TARGET_AMOUNT(values).one();

    const totalTargetAmount = result.total_target_amount;
    res.json({ total_target_amount: totalTargetAmount });
  });
};
