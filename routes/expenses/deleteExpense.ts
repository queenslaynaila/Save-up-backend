import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { DeleteExpenseInterface } from './types'
import { IdParamInterface, MessageInterface } from '../../globalTypes/index'

const SQL_DELETE_EXPENSE = sql<{ id: number; entity_id: number }, Record<string,never>>(`
  UPDATE expenses
  SET deleted_at = NOW()
  WHERE id = :id
  AND entity_id = :entity_id
`);

export default (router: Router) => {
  router.patch<IdParamInterface, MessageInterface , DeleteExpenseInterface, Record<string,never>>(
    '/records/:id', 
    authMiddleware(), 
    async (req, res) => {
      const expenseId = parseInt(req.params.id);
      const entity_id = req.body.entity_id;
      await SQL_DELETE_EXPENSE({ id: expenseId, entity_id}).exec();
      return res.json({ message: 'Expenses deleted successfully' });
    });
};
