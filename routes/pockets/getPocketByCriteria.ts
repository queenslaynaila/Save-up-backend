import Router from '../../router';
import { sql } from '../../db';
import { ParsedQs } from 'qs';
import { z } from 'zod';
import { pocket } from './createPocket';
import verifyGroupMembership from '../../middlewares/verifyGrpMembership';

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
  group_id: z.string(),
  category_id: z.string(),
  start_date: z.string(),
  end_date: z.string()
}).partial();

const getPocketsByUser = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:user_id',
    summary: 'Retrieve a list of pockets for a user or group',
    description: 'Fetches a list of pockets belonging to a specific user or group, with optional filters to refine the results.\n'
      + '- If the path parameter is **me**, the request will return the pockets of the logged-in user.\n'
      + '- If the path parameter is a user ID, the request will return the pockets of the specified user.\n'
      + '- Admins and moderators can request pockets for any user or group\n'
      + '- Regular users can only access their own pockets or of grps they are in\n'
      + '- **Query Parameters**:\n'
        + '- **xid**: The unique identifier for a specific pocket.\n'
        + '- **group_id**: The ID of the group whose pockets are to be fetched. m\n'
        + '- **category_id**: The category of the pocket.\n'
        + '- **priority**: The priority level of the pocket.\n'
        + '- **status**: The current status of the pocket (e.g., active, inactive).\n'
        + '- **start_date**: Start date for filtering the records.\n'
        + '- **end_date**: End date for filtering the records.\n',
    request: {
      params: z.object({
        user_id: z.union([
          z.string().regex(/^[1-9]\d*$/, "Must be a positive integer string"),
          z.literal("me"), 
        ]).default('me' )
      }),
      query: pocketQueryParams
    },
    response: {
      200: {
        schema: z.array(pocketSchema)
      }
    },
    authMiddlewareOptions: {},
    middlewares: [verifyGroupMembership({allowAdminsAndModerators: true })],  
    handler: async (req, res) => {
      const {
        group_id,
        xid,
        category_id,
        priority,
        status,
        start_date,
        end_date
      } = req.query;

      const FinalEntity = group_id ? Number(group_id) : parseInt(req.params.user_id, 10);

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

export default getPocketsByUser;