import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { DeleteExpenseInterface } from './types'
import { IdParamInterface, MessageInterface } from '../../globalTypes/index'

const SQL_DELETE_EXPENSE = sql<{ id: number; entityId: number }, Record<string,never>>(`
  UPDATE expenses
  SET deleted_at = NOW()
  WHERE id = :id
  AND entity_id = :entityId
`);

export default (router: Router) => {
  router.patch<IdParamInterface, MessageInterface , DeleteExpenseInterface, Record<string,never>>(
    '/records/:id', 
    authMiddleware(), 
    async (req, res) => {
      const expenseId = parseInt(req.params.id);
      const entityId = req.body.entityId;
      await SQL_DELETE_EXPENSE({ id: expenseId, entityId }).exec();
      return res.json({ message: 'Expenses deleted successfully' });
    });
};
