import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { z } from 'zod';

const SQL_GET_BALANCE = sql<{ user_id: number, pocket_id: number }, { balance: number }>(`
  SELECT COALESCE((
      SELECT transactions.balance
      FROM transactions
      WHERE transactions.entity_id = :user_id
        AND transactions.pocket_id = :pocket_id
      ORDER BY transactions.created_at DESC
      LIMIT 1
  ), 0) AS balance
`);

const getBalanceForPocket = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:pocket_id/balance',
    summary: 'Get the current balance for a pocket',
    schema: {
      params: z.object({ pocket_id: z.string() })
    },
    response: {
      schema: z.object({ balance: z.number() })
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const balance = await SQL_GET_BALANCE({
        pocket_id: Number(req.params.pocket_id),
        user_id: req.user!.id
      }).one();

      return res.json(balance);
    }
  });
};

export default getBalanceForPocket;