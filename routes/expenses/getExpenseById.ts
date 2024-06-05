import { Router } from 'express';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/authorization';
import { ExpenseInterface } from './types';
import { IdParamInterface, XidEntityInterface } from '../../globalTypes/index'

const SQL_GET_EXPENSE_BY_ID = sql<XidEntityInterface,  ExpenseInterface>(`
  SELECT xid, entity_id, category_id, description, amount, spent_at, created_at
  FROM expenses 
  WHERE xid = :xid 
  AND entity_id = :entity_id
`);

export default (router: Router) => {
  router.get<IdParamInterface, ExpenseInterface, Record<string,never>, Record<string,never>>(
    '/me/:id', 
    authMiddleware(), 
    async (req, res) => {
      const entity_id = req.body.entity_id ? req.body.entity_id : req.user!.id;
      const result = await SQL_GET_EXPENSE_BY_ID({ xid:parseInt(req.params.id), entity_id })
        .one(new HttpError(404, 'Not found'));
      return res.json(result);
    });
};