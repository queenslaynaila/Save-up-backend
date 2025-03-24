import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import HttpError from '../../httpError';
import { entityIdParamsSchema, UserRole } from '../users/schema';
import { decodeEntityAndVerifyAccess } from '../../utils';
import { NextOfKin, nextOfKinSchema } from './schema';

const SQL_GET_KIN = sql<
  Pick<NextOfKin, 'user_id'> & { include_history?: boolean }, 
  Pick<NextOfKin, 'xid' | 'full_name' | 'relationship' | 'phone_number' | 'created_at'>
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
  ORDER BY xid DESC;
`);

const getNextOfKin = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:user_id',
    summary: 'Retrieve next of kin details',
    description: 'Fetches next of kin details for a user. Standard users can only view active records.',
    auth: true,
    request: {
      params: z.object({
        user_id: entityIdParamsSchema
      }),
      query: z.object({
        include_history: z.boolean()
      }).partial()
    },
    response: {
      200: {
        schema: z.array(
          nextOfKinSchema.pick({
            xid: true,
            full_name: true,
            relationship: true,
            phone_number: true,
            created_at: true
          })
        )
      }
    },
    handler: async (req, res) => {
      const userId = await decodeEntityAndVerifyAccess(req, true);
      const { include_history  } = req.query;

      if (req.user!.role === UserRole.Enum.Standard && include_history) {
        throw new HttpError(403);
      }

      const nextOfKins = await SQL_GET_KIN({
        user_id: userId,
        include_history
      }).many();

      return res.json(nextOfKins);
    }
  });
};

export default getNextOfKin;