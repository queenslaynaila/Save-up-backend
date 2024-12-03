import Router from '../../router';
import { sql } from '../../db';
import { ParsedQs } from 'qs';
import { z } from 'zod';
import { pocket } from './createPocket';
import { UserRole } from '../../types';
import HttpError from '../../httpError';

const pocketSchema = pocket.omit({
  entity_id: true,
  category_id: true,
  completed_at: true
}).extend({
  category_name: z.string()
});

type Pocket = z.infer<typeof pocketSchema>;

const SQL_GET_POCKETS = sql<{ entity_id: number }, Pocket>(`
  SELECT pockets.xid, 
        pockets.name, 
        (
        SELECT categories.name FROM categories WHERE categories.id = pockets.category_id
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
`);

const pocketQueryParams = pocketSchema.pick({
  priority: true,
  status: true
}).extend({
  xid: z.string(),
  entity_id: z.string().default('me'),
  category_id: z.string(),
  start_date: z.string(),
  end_date: z.string()
}).partial();

const getPocketByCriteria = (router: Router) => {
  router.route({
    method: 'get',
    path: '/',
    summary: 'Get list of pockets',
    description: 'Fetches a list of pockets based on various criteria. \n'
     + '- **entity_id**: The ID of the user or group whose pockets are to be fetched. \n'
     + '- If no entity_id is provided, it defaults to "me" and fetches the logged-in user\'s pockets. \n'
     + '- Admins and moderators can request pockets for any user or group using a user ID or group ID..\n'
     + '- Note that the user_id or group_is must be sent as an entity_id query param.\n'
     + '- Other query parameters include xid, category_id, priority, status, start_date, and end_date.\n',
    schema: {
      query: pocketQueryParams
    },
    response: {
      schema: z.array(pocketSchema)
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const { entity_id = 'me', xid, category_id, priority, status, start_date, end_date } = req.query;

      const FinalEntity = entity_id ? req.user!.id : parseInt(entity_id, 10);

      if (req.user!.role === UserRole.USER && req.user!.id !== FinalEntity) {
        throw new HttpError(403);
      }

      const filters: string[] = [];
      const filterArgs: string | string [] | ParsedQs | ParsedQs[] = {};

      if (category_id) {
        filterArgs.category_id = category_id;
        filters.push('category_id = :category_id');
      }

      if (priority) {
        filterArgs.priority = priority;
        filters.push('priority = :priority');
      }

      if (status) {
        filterArgs.status = status;
        filters.push('status = :status');
      }

      if (xid) {
        filterArgs.xid = xid;
        filters.push('xid = :xid');
      }

      if (start_date && end_date) {
        filterArgs.start_date = start_date;
        filterArgs.end_date = end_date;
        filters.push('DATE(completed_at) BETWEEN :start_date AND :end_date');
      } else {
        if (start_date) {
          filterArgs.start_date = start_date;
          filters.push('DATE(created_at) >= :start_date');
        }
        if (end_date) {
          filterArgs.end_date = end_date;
          filters.push('DATE(created_at)<= :end_date');
        }
      }

      const query = SQL_GET_POCKETS({
        entity_id: FinalEntity
      });
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      res.json(await query.many());
    }
  });
};

export default getPocketByCriteria;