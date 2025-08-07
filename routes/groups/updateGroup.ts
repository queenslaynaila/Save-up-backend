import Router from '../../core/router';
import { sql } from '../../db';
import { z } from 'zod';
import { decodeParamsAndAuthorizeAccess } from '../../decodeParamsAndAuthorizeAccess';
import { groupsSchema } from './schema';

const SQL_RECORD_OLD_NAME = sql<
{ group_id: number },
Record<string, never>
>(`
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
{ group_id: number; name: string },
{ name: string }
>(`
  UPDATE groups
  SET name = :name
  WHERE id = :group_id
    AND deleted_at IS NULL
  RETURNING groups.name;
`);

const updateGroup = (router: Router) => {
  router.patch({
    path: '/:group_id',
    summary: 'Update group name',
    description: 'Update group name',
    auth: true,
    schema: {
      params: z.object({
        group_id: z.number().int().min(1)
      }),
      body: groupsSchema.pick({
        name: true
      })
    },
    response: {
      schema: groupsSchema.pick({
        name: true
      })
    },
    handler: async (req, res) => {
      const groupId = await decodeParamsAndAuthorizeAccess(req);

      const name = await sql.transaction(async (trx) => {
        await SQL_RECORD_OLD_NAME({
          group_id: groupId
        })
          .using(trx)
          .exec();

        return await SQL_UPDATE_GROUP_NAME({
          ...req.body,
          group_id: groupId
        })
          .using(trx)
          .oneFirst();
      });

      res.json({ name });
    }
  });
};

export default updateGroup;