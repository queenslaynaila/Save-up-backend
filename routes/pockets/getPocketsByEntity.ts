import Router from '../../core/router';
import { sql } from '../../db';
import { z } from 'zod';
import { decodeEntityAndVerifyAccess } from '../../utils';
import { entityIdParamsSchema } from '../users/schema';
import { pocketSchema } from './schema';

const pocketFilterParams = pocketSchema
  .pick({
    entity_id: true,
    xid: true,
    category_id: true,
    priority: true,
    status: true
  })
  .extend({
    start_date: z.string().optional(),
    end_date: z.string().optional()
  })
  .partial()
  .required({ entity_id: true });

type PocketFilters = z.infer<typeof pocketFilterParams>;

const pocketReturnSchema = pocketSchema
  .pick({
    xid: true,
    name: true,
    pocket_type: true,
    priority: true,
    status: true,
    currency: true,
    target_amount: true,
    target_at: true,
    created_at: true
  })
  .extend({
    category_name: z.string()
  });

type PocketReturn = z.infer<typeof pocketReturnSchema>;

const SQL_GET_POCKETS = sql<PocketFilters, PocketReturn>(`
  SELECT 
    pockets.xid,
    pockets.name,
    (
      SELECT categories.name 
      FROM categories 
      WHERE categories.id = pockets.category_id
    ) AS category_name,
    pockets.currency,  
    pockets.target_amount,
    pockets.priority,
    pockets.status,
    pockets.pocket_type,
    pockets.target_at,
    pockets.created_at
  FROM pockets
  WHERE pockets.deleted_at IS NULL
    AND pockets.entity_id = :entity_id
    AND (:xid::INT IS NULL OR pockets.xid = :xid)
    AND (:category_id::INT IS NULL OR pockets.category_id = :category_id)
    AND (:priority::enum_priority IS NULL OR pockets.priority = :priority)
    AND (:status::enum_status IS NULL OR pockets.status = :status)
    AND (:start_date::DATE IS NULL OR DATE(pockets.created_at) >= :start_date)
    AND (:end_date::DATE IS NULL OR DATE(pockets.created_at) <= :end_date)
`);

const getPocketsByEntity = (router: Router) => {
  router.get({
    path: '/:entity_id/pockets',
    summary: 'Get pockets for a system entity',
    schema: {
      params: z.object({
        entity_id: entityIdParamsSchema
      }),
      query: pocketSchema.pick({
        priority: true,
        status: true,
        xid: true,
        category_id: true
      }).extend({
        start_date: z.string(),
        end_date: z.string()
      }).partial()
    },
    response: {
      schema: z.array(pocketReturnSchema)
    },
    auth: true,
    handler: async (req, res) => {
      const entityId = await decodeEntityAndVerifyAccess(req, true);
      const {
        xid,
        category_id,
        priority,
        status,
        start_date,
        end_date
      } = req.query;

      const pockets = await SQL_GET_POCKETS({
        entity_id: entityId,
        xid,
        category_id,
        priority,
        status,
        start_date,
        end_date
      }).many();

      res.json(pockets);
    }
  });
};

export default getPocketsByEntity;
