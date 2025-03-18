import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import { pocketSchema } from './schema';
import verifyGroupMembership, { decodeEntityOrUserId } from '../../utils';
import { entityIdParamsSchema } from '../users/schema';

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

const SQL_UPDATE_POCKET = sql<
PocketPatchParams, 
Pocket>(`
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
    path: '/:entity_id/pockets/:xid',
    summary: 'Update pocket',
    request: {
      params: z.object({
        entity_id: entityIdParamsSchema,
        xid: z.number()
      }),
      body: pocketSchema.pick({
        category_id: true,
        name: true,
        priority: true,
        pocket_type: true,
        target_amount: true,
        target_at: true
      }).partial()
    },
    response: {
      200: {
        schema:pocketSchema
        .pick({
          category_id: true,
          entity_id: true,
          name: true,
          priority: true,
          pocket_type: true,
          target_amount: true,
          target_at: true
        }).partial()
      }
    },
    auth: true,
    middlewares: [
      verifyGroupMembership({ requiresGrpAdmin: true })
    ],
    handler: async (req, res) => {
      const entityId = decodeEntityOrUserId(req, true);
      const pocket = await SQL_UPDATE_POCKET({
        xid: req.params.xid,
        entity_id: entityId,
        ...req.body
      }).one();

      return res.json(pocket);
    }
  });
};

export default updatePocket;