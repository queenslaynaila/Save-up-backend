import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import verifyGroupMembership from '../../utils';

const SQL_INNER_BALANCE = sql<
  { 
    entity_id: number;
    pocket_id?: string;
    from?: string;
    to?: string 
  },
  { balance: number }
>(`
  SELECT DISTINCT ON (pocket_id) balance
  FROM transactions
  WHERE entity_id = :entity_id
`);

const getBalanceForAnEntity = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:entity_id/balance',
    summary: 'Retrieve current balance for an entity across pockets',
    request: {
      params: z.object({
        entity_id: z.union([
          z.string().regex(/^[1-9]\d*$/),
          z.literal("me")
        ]).default('me')
      }),
      query: z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        pocket_id: z.string().optional()
      }).partial()
    },
    response: {
      200: {
        schema: z.object({ 
          balance: z.number() 
        })
      }
    },
    authMiddlewareOptions: {},
    middlewares: [
      verifyGroupMembership({ allowModeratorAccess: true })
    ],
    handler: async (req, res) => {
      const entity_id = Number(req.params.entity_id);
      const { pocket_id, from, to } = req.query;

      const filterArgs: {
        entity_id: number;
        from?: string;
        to?: string;
        pocket_id?: string;
      } = { entity_id };

      const filters: string[] = [];

      if (pocket_id) {
        filterArgs.pocket_id = pocket_id;
        filters.push('pocket_id = :pocket_id');
      }

      if (from && to) {
        filterArgs.from = from;
        filterArgs.to = to;
        filters.push('DATE(transactions.created_at) BETWEEN :from AND :to');
      } else if (from) {
        filterArgs.from = from;
        filters.push('DATE(transactions.created_at) >= :from');
      } else if (to) {
        filterArgs.to = to;
        filters.push('DATE(transactions.created_at) <= :to');
      }

      const query = SQL_INNER_BALANCE(filterArgs);
      
      if (filters.length > 0) {
        query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      }
      
      query.extend('ORDER BY pocket_id, created_at DESC', {});

      const balance = await query.many();
      const totalBalance = balance.reduce(
        (sum, row) => sum + (row.balance || 0),
        0
      );

      res.json({ balance: totalBalance });
    }
  });
};

export default getBalanceForAnEntity;