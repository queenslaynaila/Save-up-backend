import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import { pocketSchema } from './schema';
import verifyGroupMembership from '../../utils';
import logger from '../../logger';

const pocketPatchParams = pocketSchema.pick({
  xid: true,
  entity_id: true,
  category_id: true,
  name: true,
  priority: true,
  pocket_type: true,
  target_amount: true,
  target_at: true
}).partial();
type PocketPatchParams = z.infer<typeof pocketPatchParams>;

const pocket = pocketSchema.pick({
  name: true,
  category_id: true,
  target_amount: true,
  priority: true,
  pocket_type: true,
  target_at: true
}).extend({
  category_name: z.string()
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
  RETURNING name, 
            category_id, 
            (SELECT name FROM categories WHERE id = pockets.category_id) AS category_name,
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
          z.string().regex(/^[1-9]\d*$/, "Must be a positive integer string"),
          z.literal("me"), 
        ]).default('me' ),
        xid: z.string().min(1)
      }),
      body: pocketPatchParams.omit({ xid: true })
    },
    response: {
      200: {
        schema: pocket
      }
    },
    authMiddlewareOptions: {},
    middlewares: [verifyGroupMembership()],
    handler: async (req, res) => {
      const entity_id = Number(req.params.entity_id);

      const { name, category_id, target_amount, priority, target_at, pocket_type } = req.body;
  
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