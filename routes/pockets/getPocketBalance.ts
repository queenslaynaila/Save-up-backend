import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import verifyGroupMembership, { decodeEntityOrUserId } from '../../utils';
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
      AND (:pocket_id::INT IS NULL OR pocket_id = :pocket_id)
      AND (:from::DATE IS NULL OR DATE(created_at) >= :from) 
      AND (:to::DATE IS NULL OR DATE(created_at) <= :to) 
    ORDER BY pocket_id, xid DESC
  ) latest_balances
`);

const getBalanceForAnEntity = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:entity_id/pockets/balance',
    summary: 'Retrieve current balance for an entity across pockets',
    request: {
      params: z.object({
        entity_id: entityIdParamsSchema
      }),
      query: z.object({
        from: z.string().optional(),
        to: z.string().optional()
        // pocket_id: z.string().optional()
      }).partial()
    },
    response: {
      200: {
        schema: z.object({
          balance: z.number()
        })
      }
    },
    auth: true,
    middlewares: [
      verifyGroupMembership({ isOwnerOrAdminMod: true })
    ],
    handler: async (req, res) => {
      const entityId = decodeEntityOrUserId(req, true);
      const balance = await SQL_GET_BALANCE({
        entity_id: entityId,
        ...req.query
      }).oneFirst();

      res.json({ balance });
    }
  });
};

export default getBalanceForAnEntity;