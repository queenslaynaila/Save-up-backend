import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import { 
  entityIdParamsSchema,
  IdType, 
  userSchema
} from './schema';
import { decodeEntityAndVerifyAccess } from '../../utils';

const IdParams = z.object({
  id_type: IdType,
  id_number: userSchema.shape.id_number
});

type UserIdParams = z.infer<typeof IdParams> & { 
  user_id: number 
};

const SQL_UPDATE_ID_NUMBER = sql<
  Pick<UserIdParams, 'user_id' | 'id_type' | 'id_number'>,
  Pick<UserIdParams, 'id_number'>
>(`
  SELECT * FROM update_id_number(
    :user_id,
    :id_type::enum_id_type,
    :id_number
  )
`);

const updateIdDetails = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/:user_id/id-details',
    summary: 'Update ID type and number',
    auth: true,
    schema: {
      params: z.object({
        user_id: entityIdParamsSchema
      }),
      body: z.object({
        id_type: IdType,
        id_number: userSchema.shape.id_number
      })
    },
    response: {
        schema: z.object({
          id_number: userSchema.shape.id_number
        })
    },
    handler: async (req, res) => {
      const userId = await decodeEntityAndVerifyAccess(req);

      const { id_number } = await SQL_UPDATE_ID_NUMBER({
        user_id: userId,
        ...req.body
      }).one();
      res.json({ id_number });
    }
  });
};

export default updateIdDetails;