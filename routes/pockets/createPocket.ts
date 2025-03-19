import Router from '../../router';
import { sql } from '../../db';
import { pocketSchema, Pocket } from './schema';
import { z } from 'zod';
import { decodeEntityAndVerifyAccess } from '../../utils';
import { entityIdParamsSchema } from '../users/schema';
import { group } from 'node:console';

type PocketCreationParams = Pick<
  Pocket,
  | 'entity_id'
  | 'category_id'
  | 'name'
  | 'priority'
  | 'pocket_type'
  | 'target_amount'
  | 'target_at'
>;

type CreatedPocket = Pick<
  Pocket,
  | 'entity_id'
  | 'xid'
  | 'category_id'
  | 'name'
  | 'priority'
  | 'status'
  | 'pocket_type'
  | 'target_amount'
  | 'target_at'
  | 'created_at'
  | 'completed_at'
>;

const SQL_CREATE_POCKET = sql<PocketCreationParams, CreatedPocket>(`
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
    path: '/:entity_id/pockets',
    summary: 'Create a pocket',
    request: {
      params: z.object({
        entity_id: entityIdParamsSchema,
      }),
      body: pocketSchema.pick({
        category_id: true,
        name: true,
        priority: true,
        pocket_type: true,
        target_amount: true,
        target_at: true
      })
    },
    response: {
      201: {
        schema: pocketSchema.pick({
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
        })
      }
    },
    auth: true,
    handler: async (req, res) => {
      const entityId =  await decodeEntityAndVerifyAccess(req);
      const pocket = await SQL_CREATE_POCKET({
        ...req.body,
        entity_id: entityId
      }).one();

      return res.json(pocket);
    }
  });
};

export default createPocket;