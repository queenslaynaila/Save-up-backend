import authMiddleware from '../../middleware/auth';
import { expenseSchema } from '../../types';
import { Router } from 'express';
import { idSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { hasPermission } from '../../middleware/hasPermission';
import { sql } from '../../db';

export default (router: Router) => {
  router.get(
    '/:id',
    authMiddleware(),
    async (req, res) => {
      // Validate expense ID
      const validationResult = idSchema.safeParse(req.params.id);
      if (!validationResult.success) {
        throw new HttpError(400, 'Invalid expense ID');
      }

      const id = validationResult.data;
      const userId = req.user!.id;
      const loggedInUserRole = req.user!.role;

      if (!hasPermission(req, userId, loggedInUserRole)) {
        throw new HttpError(403, 'Unauthorized access');
      }

      const query = 'SELECT * FROM expenses WHERE id = :id AND user_id = :userId';
      const SQL_GET_EXPENSE_BY_ID = sql<{ id: string; user_id: string }, typeof expenseSchema & { id: string; created_at: string; updated_at: string; month: string }>(query);
      const result = await SQL_GET_EXPENSE_BY_ID({ id, user_id: userId }).one();
      return res.json(result);
    }
  );
};
