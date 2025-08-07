import Router from '../../core/router';
import { sql } from '../../db';
import { z } from 'zod';
import { Pocket, pocketSchema } from './schema';
import { decodeParamsAndAuthorizeAccess } from '../../decodeParamsAndAuthorizeAccess';
import { entityIdParamsSchema } from '../users/schema';
import HttpError from '../../httpError';

const pocketPatchParams = pocketSchema.pick({
  entity_id:true,
  xid:true,
  category_id: true,
  name: true,
  priority: true,
  pocket_type: true,
  target_amount: true,
  target_at: true
  })
  .partial()
  .required({
    entity_id: true,
    xid:true
  })

type PocketPatchParams = z.infer<typeof pocketPatchParams>;

const SQL_UPDATE_POCKET = sql<
PocketPatchParams,
Pick<Pocket, 'name'|'category_id'|'pocket_type'|'target_amount'|'priority'|'target_at'> & {category_name:string}
>(`
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
  router.patch({
    path: '/:entity_id/pockets/:xid',
    summary: 'Update pocket',
    schema: {
      params: z.object({
        entity_id: entityIdParamsSchema,
        xid: z.number().int().min(1)
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
        schema:pocketSchema.pick({
          category_id: true,
          name: true,
          priority: true,
          pocket_type: true,
          target_amount: true,
          target_at: true
        }).extend({
          category_name: z.string()
        })
    },
    auth: true,
    handler: async (req, res) => {
      const entityId = await decodeParamsAndAuthorizeAccess(req);

      const {
        name,
        category_id,
        target_amount,
        priority,
        pocket_type,
        target_at
      } = req.body;

      const pocket = await SQL_UPDATE_POCKET({
        xid: req.params.xid,
        entity_id: entityId,
        name,
        category_id,
        target_amount,
        priority,
        pocket_type,
        target_at
      }).one(new HttpError(404));

      return res.json(pocket);
    }
  });
};

export default updatePocket;