import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import { decodeEntityAndVerifyAccess } from '../../utils';
import { groupsSchema } from './schema';

const SQL_RECORD_OLD_NAME = sql<{ group_id: number }, Record<string, never>>(`
  INSERT INTO prev_group_names (group_id, xid, name)
  SELECT 
    groups.id,
    COALESCE(MAX(prev_group_names.xid), 0) + 1,
    groups.name
  FROM groups
  LEFT JOIN prev_group_names 
    ON prev_group_names.group_id = groups.id
  WHERE groups.id = :group_id
  GROUP BY groups.id; 
`);

const SQL_UPDATE_GROUP_NAME = sql<
  { 
    group_id: number; 
    name: string;
  },
  { name: string }
>(`
  UPDATE groups
  SET name = :name
  WHERE id = :group_id
    AND deleted_at IS NULL
  RETURNING groups.name;
`);

const updateGroup = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/:group_id',
    summary: 'Update group details',
    description: 'Update group name',
    auth: true,
    request: {
      params: z.object({
        group_id: z.number()
      }),
      body: groupsSchema.pick({
        name: true
      })
    },
    response: {
      200: {
        schema: groupsSchema.pick({
          name: true
        })
      }
    },
    handler: async (req, res) => {
      const groupId = await decodeEntityAndVerifyAccess(req);

      const name = await sql.transaction(async (trx) => {
        await SQL_RECORD_OLD_NAME({ group_id: groupId })
          .using(trx)
          .exec();

        return await SQL_UPDATE_GROUP_NAME({
          group_id: groupId,
          ...req.body
        }).using(trx).oneFirst();
      });

      res.json({ name });
    }
  });
};

export default updateGroup;
