import Router from '../../router';
import { sql } from '../../db';
import { NextOfKin, nextOfKinPublicViewSchema } from './createNextOfKin';
import { z } from 'zod';
import HttpError from '../../httpError';
import { entityIdParamsSchema, userIdParamsSchema, UserRole } from '../users/schema';
import { decodeEntityAndVerifyAccess } from '../../utils';

const SQL_GET_KIN = sql<
  { 
    user_id: number;
    include_history: boolean;
  }, 
  NextOfKin
>(`
  SELECT 
    xid,
    full_name,
    relationship,
    phone_number,
    created_at
  FROM next_of_kins 
  WHERE user_id = :user_id
    AND (
      :include_history::boolean = true 
      OR deleted_at IS NULL
    )
  ORDER BY xid DESC
`);

const getNextOfKin = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:user_id',
    summary: 'Retrieve next of kin details',
    description: 'Fetches next of kin details for a user. Standard users can only view active records.',
    request: {
      params: z.object({
        user_id: entityIdParamsSchema
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
    auth: true,
    handler: async (req, res) => {
      const userId = await decodeEntityAndVerifyAccess(req, true);;
      const { include_history = 'false' } = req.query;

      if (req.user!.role === UserRole.Enum.Standard && include_history === 'true') {
        throw new HttpError(403);
      }

      const nextOfKins = await SQL_GET_KIN({
        user_id: userId,
        include_history: include_history === 'true'
      }).many();

      return res.json(nextOfKins);
    }
  });
};

export default getNextOfKin;