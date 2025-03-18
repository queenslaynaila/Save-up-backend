import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import verifyGroupMembership, { decodeEntityOrUserId } from '../../utils';
import { entityIdParamsSchema } from '../users/schema';

const SQL_TOTAL_SAVINGS = sql<
  {
    entity_id: number;
    from?: string;
    to?: string;
    limit: number
  },
  {
    name: string;
    total_savings: number
  }
>(`
  SELECT 
    pockets.name,
    COALESCE(SUM(transactions.delta), 0) AS total_savings
  FROM transactions
  JOIN transaction_types 
    ON transactions.type_id = transaction_types.id
  JOIN pockets 
    ON transactions.entity_id = pockets.entity_id 
    AND transactions.pocket_id = pockets.xid
  WHERE transactions.entity_id = :entity_id
    AND transaction_types.slug = 'Saving'
    AND (:from::DATE IS NULL OR DATE(transactions.created_at) >= :from)
    AND (:to::DATE IS NULL OR DATE(transactions.created_at) <= :to)
  GROUP BY pockets.name
  LIMIT :limit
`);

const getTotalSavings = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:entity_id/pockets/total-savings',
    summary: 'Get total savings across all pockets for an entity',
    request: {
      params: z.object({
        entity_id: entityIdParamsSchema
      }),
      query: z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        limit: z.string()
      })
    },
    response: {
      200: {
        schema: z.array(
          z.object({
            name: z.string(),
            total_savings: z.number()
          })
        )
      }
    },
    auth: true,
    middlewares: [
      verifyGroupMembership({ isOwnerOrAdminMod: true })
    ],
    handler: async (req, res) => {
      const entityId = decodeEntityOrUserId(req, true);
      const limit = Number(req.query.limit);
      const { from, to } = req.query;

      const stats = await SQL_TOTAL_SAVINGS({
        entity_id: entityId,
        from,
        to,
        limit
      }).many();

      res.json(stats);
    }
  });
};

export default getTotalSavings;