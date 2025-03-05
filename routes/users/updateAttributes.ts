import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import { IdType, userSchema } from './schema';

const userIdParams = z.object({
  id_type: IdType,
  id_number: userSchema.shape.id_number
});

type UserIdParams = z.infer<typeof userIdParams> & { user_id: number };

const SQL_UPDATE_ID_NUMBER = sql<UserIdParams, Record<string,never>>(`
  SELECT * 
  FROM update_id_number(
    :user_id, 
    :id_type, 
    :id_number
  )
`);

const updateUserAttributes = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/:user_id/id-details',
    summary: 'Update ID type and number',
    request: {
      params: z.object({
        user_id: z.string().regex(/^\d+$/)
      }),
      body: userIdParams
    },
    response: {
      200: {},
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const { id_type, id_number } = req.body;
       await SQL_UPDATE_ID_NUMBER({
        user_id: req.user!.id,
        id_type,
        id_number
      }).exec();

      res.sendStatus(200);
    }
  });
};

export default updateUserAttributes;