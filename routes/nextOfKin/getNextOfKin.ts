import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { NextOfKin, nextOfKinPublicViewSchema } from './createNextOfKin';
import { z } from 'zod';
import { UserRole } from '../../globalTypes';
import { HttpError } from '../../middleware/errorMiddleware';

const SQL_GET_KIN = sql<{user_id:number}, NextOfKin>(`
  SELECT xid, full_name, relationship, phone_number, created_at
  FROM next_of_kins 
  WHERE user_id = :user_id
  AND deleted_at is null
`);

const getNextOfKin = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:user_id',
    summary: 'Get next of kin for a specific user',
    description: 'Fetches the next of kin details for a specific user.\n'
    + 'The "user_id" parameter can represent different identifiers, including:\n'
    + '- **User ID**: The unique identifier of the user.\n'
    + '- **"me"**: The string "me" can be used to fetch details of the currently logged-in user.\n'
    + 'Standard users can only access their own details by using "me", while moderators and admins have access to query any users next of kin using any of the above identifiers.',
    schema: {
      params: z.object({
        user_id: z.string()
      })
    },
    response: {
      schema: nextOfKinPublicViewSchema
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const param = req.params.user_id;
      const user_id = param === 'me' ? req.user!.id : parseInt(param, 10);

      if (Number.isNaN(user_id)) {
        throw new HttpError(400);
      }

      if (
        req.user!.role !== UserRole.ADMIN
        && req.user!.role !== UserRole.MODERATOR
        && req.user!.id !== user_id
      ) {
        throw new HttpError(403);
      }

      const nextOfKin = await SQL_GET_KIN({
        user_id
      }).oneOrNull();
      return res.json(nextOfKin);
    }
  });
};

export default getNextOfKin;