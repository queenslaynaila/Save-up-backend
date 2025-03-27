import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import { decodeEntityAndVerifyAccess } from '../../utils';
import { entityIdParamsSchema } from '../users/schema';

const SQL_GET_BALANCE = sql<
  {
    entity_id: number;
    pocket_id?: number;
    from?: string;
    to?: string;
  },
  { balance: number }
>(`
  SELECT COALESCE(SUM(balance), 0) as balance
  FROM (
    SELECT DISTINCT ON (pocket_id) balance
    FROM transactions
    WHERE entity_id = :entity_id
      AND (:pocket_id IS NULL OR pocket_id = :pocket_id)
      AND (:from IS NULL OR created_at::DATE >= :from) 
      AND (:to IS NULL OR created_at::DATE <= :to) 
    ORDER BY pocket_id, xid DESC
  ) latest_balances
`);

const getBalanceForAnEntity = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:entity_id/pockets/balance',
    summary: 'Retrieve current balance for an entity across pockets',
    auth: true,
    schema: {
      params: z.object({
        entity_id: entityIdParamsSchema
      }),
      query: z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        pocket_id: z.number().int().min(1).optional()
      }).partial()
    },
    response: {
        schema: z.object({
          balance: z.number()
        })
    },
    handler: async (req, res) => {
      const entityId = await decodeEntityAndVerifyAccess(req, true);
      const balance = await SQL_GET_BALANCE({
        entity_id: entityId,
        ...req.query
      }).oneFirst();

      res.json({ balance });
    }
  });
};

export default getBalanceForAnEntity;