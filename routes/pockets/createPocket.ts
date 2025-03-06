import Router from '../../router';
import { sql } from '../../db';

import { pocketSchema } from './schema';
import { z } from 'zod';
import verifyGroupMembership from '../../utils';

const pocketCreationSchema = pocketSchema.pick({
  category_id: true,
  name: true,
  priority: true,
  pocket_type: true,
  target_amount: true,
  target_at: true
}).extend({
  entity_id: pocketSchema.shape.entity_id.optional()
});
type PocketCreationType = z.infer<typeof pocketCreationSchema>;

export const pocket = pocketSchema.omit({
  deleted_at: true
});
type Pocket = z.infer<typeof pocket>;

const SQL_CREATE_POCKET = sql<PocketCreationType, Pocket>(`
  INSERT INTO pockets (entity_id, xid, category_id, name, priority, pocket_type, target_amount, target_at)
  SELECT :entity_id,
          COALESCE(MAX(xid), 0) + 1,
          :category_id,
          :name,
          :priority,
          :pocket_type,
          :target_amount,
          :target_at
  FROM pockets 
  WHERE entity_id = :entity_id
  RETURNING entity_id, 
            xid, 
            category_id, 
            name, 
            priority, 
            status, 
            pocket_type, 
            target_amount,  
            target_at, 
            created_at, 
            completed_at
`);

const createPocket = (router: Router) => {
  router.route({
    method: 'post',
    path: '/:entity_id',
    summary: 'Create a pocket',
    request: {
      params: z.object({
        entity_id: z.union([
          z.string().regex(/^[1-9]\d*$/, "Must be a positive integer string"),
          z.literal("me"), 
        ]).default('me' )
      }),
      body: pocketCreationSchema
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
      const newPocket = await SQL_CREATE_POCKET({
        ...req.body,
        entity_id
      }).one();
      return res.json(newPocket);
    }
  });
};

export default createPocket;