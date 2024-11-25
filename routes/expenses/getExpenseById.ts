import Router from '../../router';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/authorization';
import { Expense, ExpenseSchema } from './types';
import { entitySchema, idParamSchema, XidEntityInterface } from '../../globalTypes';

const SQL_GET_EXPENSE_BY_ID = sql<XidEntityInterface, Expense>(`
  SELECT xid, entity_id, category_id, description, amount, spent_at, created_at
  FROM expenses 
  WHERE xid = :xid 
  AND entity_id = :entity_id
  AND deleted_at IS NULL
`);

const getExpenseById = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:id',
    summary: 'Get an expense by id',
    schema: {
      params: idParamSchema,
      body: entitySchema
    },
    response: {
      schema: ExpenseSchema
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const entity_id = req.body?.entity_id ?? req.user!.id;
      const result = await SQL_GET_EXPENSE_BY_ID({
        xid: Number(req.params.id),
        entity_id
      }).one(new HttpError(404));
      return res.json(result);
    }
  });
};

export default getExpenseById;