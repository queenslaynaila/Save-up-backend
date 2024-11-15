import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { Balance, availableSavings } from './types';
import { GetByUserInterface } from '../../globalTypes';

const SQL_GET_AVAILABLE_SAVINGS = sql<GetByUserInterface, Balance>(`
    SELECT COALESCE(SUM(balance), 0) AS available_savings
    FROM (
         SELECT DISTINCT ON (pocket_id) balance
         FROM transactions
         WHERE entity_id = :user_id
         ORDER BY pocket_id, created_at DESC
    ) AS current_balance_per_pocket;
`);

const getAvailableSavings = (router: Router) => {
  router.route({
    method: 'get',
    path: '/current-savings',
    summary: 'Get current balance across all pockets',
    response: {
      schema: availableSavings
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const result = await SQL_GET_AVAILABLE_SAVINGS({
        user_id: req.user!.id
      }).one(new HttpError(404));
      return res.json(result);
    }
  });
};

export default getAvailableSavings;