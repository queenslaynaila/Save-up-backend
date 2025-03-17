import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import { newPocketSchema } from './createPocket';
import verifyGroupMembership from '../../utils';

const pocketSchema = newPocketSchema
  .pick({
    xid: true,
    name: true,
    pocket_type: true,
    priority: true,
    status: true,
    target_amount: true,
    target_at: true,
    created_at: true
  })
  .extend({
    category_name: z.string()
  });

type Pocket = z.infer<typeof pocketSchema>;

const pocketQueryParams = pocketSchema
  .pick({
    priority: true,
    status: true
  })
  .extend({
    xid: z.string(),
    category_id: z.string(),
    start_date: z.string(),
    end_date: z.string()
  }).partial();

const SQL_GET_POCKETS = sql<
  {
    entity_id: number;
    xid?: string;
    category_id?: string;
    priority?: string;
    status?: string;
    start_date?: string;
    end_date?: string
  },
  Pocket
>(`
  SELECT 
    pockets.xid,
    pockets.name,
    (
      SELECT categories.name 
      FROM categories 
      WHERE categories.id = pockets.category_id
    ) AS category_name,
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
  router.route({
    method: 'get',
    path: '/:entity_id/pockets',
    summary: 'Get pockets for a system entity',
    request: {
      params: z.object({
        entity_id: z.union([
          z.string().regex(/^[1-9]\d*$/),
          z.literal("me")
        ]).default('me')
      }),
      query: pocketQueryParams
    },
    response: {
      200: {
        schema: z.array(pocketSchema)
      }
    },
    authMiddlewareOptions: {},
    middlewares: [
      verifyGroupMembership({ privilegedRoles:'all' })
    ],
    handler: async (req, res) => {
      const entityId = Number(req.params.entity_id);
      const { xid, category_id, priority, status, start_date, end_date } = req.query;

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
