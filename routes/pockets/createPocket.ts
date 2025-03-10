import Router from '../../router';
import { sql } from '../../db';
import { pocketSchema } from './schema';
import { z } from 'zod';
import verifyGroupMembership from '../../utils';

const pocketParamsSchema = pocketSchema.pick({
  category_id: true,
  name: true,
  priority: true,
  pocket_type: true,
  target_amount: true,
  target_at: true
});

type PocketParams = z.infer<typeof pocketParamsSchema>;

export const newPocketSchema = pocketSchema.pick({
  entity_id: true,
  xid: true,
  category_id: true,
  name: true,
  priority: true,
  status: true,
  pocket_type: true,
  target_amount: true,
  target_at: true,
  created_at: true,
  completed_at: true
});

type Pocket = z.infer<typeof newPocketSchema>;

const SQL_CREATE_POCKET = sql<PocketParams & { entity_id: number }, Pocket>(`
  INSERT INTO pockets (
    entity_id,
    xid,
    category_id,
    name,
    priority,
    pocket_type,
    target_amount,
    target_at
  )
  SELECT 
    :entity_id,
    COALESCE(MAX(xid), 0) + 1,
    :category_id,
    :name,
    :priority,
    :pocket_type,
    :target_amount,
    :target_at
  FROM pockets 
  WHERE entity_id = :entity_id
  RETURNING 
    entity_id,
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
          z.string().regex(/^[1-9]\d*$/),
          z.literal("me")
        ]).default('me')
      }),
      body: pocketParamsSchema
    },
    response: {
      201: {
        schema: newPocketSchema
      }
    },
    authMiddlewareOptions: {},
    middlewares: [
      verifyGroupMembership({ requiredGroupRole: 'Admin' })
    ],
    handler: async (req, res) => {
      const newPocket = await SQL_CREATE_POCKET({
        ...req.body,
        entity_id: Number(req.params.entity_id)
      }).one();
      
      return res.json(newPocket);
    }
  });
};

export default createPocket;