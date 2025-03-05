import Router from '../../router';
import { sql } from '../../db';
import { NextOfKin, nextOfKinPublicViewSchema } from './createNextOfKin';
import { z } from 'zod';
import HttpError from '../../httpError';
import { UserRole } from '../users/schema';

const SQL_GET_KIN = sql<{user_id: number}, NextOfKin>(`
  SELECT xid, full_name, relationship, phone_number, created_at
  FROM next_of_kins 
  WHERE user_id = :user_id
`);

const getNextOfKin = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:user_id',
    summary: 'Retrieve next of kin details',
    description:
      'Fetches the next of kin details for a user. The route supports the following scenarios:\n'
      + '- **Active next of kin**: By default, fetches the currently active (non-deleted) next of kin for the user.\n'
      + '- **Next-of-kin history**: By passing the `include_history=true` query parameter, all next-of-kin records (including soft-deleted ones) are retrieved. Only admins/mods can do this otherwise its false\n',
    request: {
      params: z.object({
        user_id: z.union([
          z.string().regex(/^[1-9]\d*$/, "Must be a positive integer string"),
          z.literal("me"), 
        ]).default('me' )
      }),
      query: z.object({
        include_history: z.string().default('false')
      }).partial()
    },
    response: {
      200: {
        schema: z.array(nextOfKinPublicViewSchema)
      }
    },
    authMiddlewareOptions: {allowModeratorAccess: true},
    handler: async (req, res) => {
      const user_id = parseInt(req.params.user_id, 10);
      const { include_history = 'false' }= req.query;
      const targetUser = user_id || req.user!.id;
      if (req.user!.role === UserRole.Enum.Standard
        && (req.user!.id !== targetUser || include_history)) {
        throw new HttpError(403);
      }

      const query = SQL_GET_KIN({ user_id: targetUser });
      if (include_history === 'false') {
        query.extend('AND deleted_at IS NULL', {});
      }
      query.extend('ORDER BY xid DESC', {});
      const nextOfKins = await query.many();
      return res.json(nextOfKins);
    }
  });
};

export default getNextOfKin;
