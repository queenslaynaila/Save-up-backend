import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import { pocketSchema } from './schema';
import verifyGroupMembership from '../../utils';

const pocketParams = pocketSchema
  .pick({
    category_id: true,
    name: true,
    priority: true,
    pocket_type: true,
    target_amount: true,
    target_at: true
  })
  .partial();

const pocketPatchParams = pocketSchema
  .partial()
  .extend({
    entity_id: z.number().int(),
    xid: z.number().int()
  });

type PocketPatchParams = z.infer<typeof pocketPatchParams>;

const pocket = pocketParams
  .extend({
    entity_id: z.number().int()
  });

type Pocket = z.infer<typeof pocket>;

const SQL_UPDATE_POCKET = sql<PocketPatchParams, Pocket>(`
  UPDATE pockets
  SET name = COALESCE(:name, name),
      category_id = COALESCE(:category_id, category_id),
      target_amount = COALESCE(:target_amount, target_amount),
      priority = COALESCE(:priority, priority),
      pocket_type = COALESCE(:pocket_type, pocket_type),
      target_at = COALESCE(:target_at, target_at)
  WHERE entity_id = :entity_id
    AND xid = :xid
    AND deleted_at IS NULL
  RETURNING 
    name,
    category_id,
    (
      SELECT name 
      FROM categories 
      WHERE id = pockets.category_id
    ) AS category_name,
    target_amount,
    priority,
    pocket_type,
    target_at
`);

const updatePocket = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/:entity_id/:xid',
    summary: 'Update pocket',
    request: {
      params: z.object({
        entity_id: z.union([
          z.string().regex(/^[1-9]\d*$/),
          z.literal("me")
        ]).default('me'),
        xid: z.string().min(1)
      }),
      body: pocketParams
    },
    response: {
      200: {
        schema: pocket
      }
    },
    authMiddlewareOptions: {},
    middlewares: [verifyGroupMembership({ requiredGroupRole: 'Admin' })],
    handler: async (req, res) => {
      const entity_id = Number(req.params.entity_id);
      const { 
        name,
        category_id,
        target_amount,
        priority,
        target_at,
        pocket_type 
      } = req.body;
  
      const goal = await SQL_UPDATE_POCKET({
        xid: Number(req.params.xid),
        entity_id,
        name,
        category_id,
        target_amount,
        priority,
        target_at,
        pocket_type
      }).one();

      return res.json(goal);
    }
  });
};

export default updatePocket;