import Router from '../../router';
import { sql } from '../../db';
import { NextOfKin, nextOfKinPublicViewSchema } from './createNextOfKin';
import { z } from 'zod';
import { UserRole } from '../../types';
import HttpError from '../../httpError';

const SQL_GET_KIN = sql<{user_id: number}, NextOfKin>(`
  SELECT xid, full_name, relationship, phone_number, created_at
  FROM next_of_kins 
  WHERE user_id = :user_id
`);

const getNextOfKin = (router: Router) => {
  router.route({
    method: 'get',
    path: '/',
    summary: 'Retrieve next of kin details',
    description:
      'Fetches the next of kin details for a user. The route supports the following scenarios:\n'
      + '- **Active next of kin**: By default, fetches the currently active (non-deleted) next of kin for the user.\n'
      + '- **Next-of-kin history**: By passing the `include_history=true` query parameter, all next-of-kin records (including soft-deleted ones) are retrieved. Only admins/mods can do this otherwise its false\n'
      + '\nThe `user_id` query parameter determines which user’s data is fetched:\n'
      + '- **Omitted**: Fetches the details for the currently logged-in user (default behavior if no `user_id` query param. \n'
      + '- **Specific user ID**: Fetches details for a specific user, but only admins or moderators can query kins by `user_id`.\n',
    request: {
      query: z.object({
        user_id: z.number(),
        include_history: z.string()
      }).partial()
    },
    response: {
      200: {
        schema: z.array(nextOfKinPublicViewSchema)
      }
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const { user_id, include_history = 'false' } = req.query;
      const targetUser = user_id || req.user!.id;
      if (req.user!.role === UserRole.USER
        && (req.user!.id !== targetUser || include_history === 'true')) {
        throw new HttpError(403);
      }

      const query = SQL_GET_KIN({ user_id: targetUser });
      if (include_history) {
        query.extend('AND (deleted_at IS NULL)', {});
      }
      const nextOfKins = await query.many();
      return res.json(nextOfKins);
    }
  });
};

export default getNextOfKin;
