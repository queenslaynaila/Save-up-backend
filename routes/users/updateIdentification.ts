import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import { 
  IdType, 
  userIdParamsSchema, 
  userSchema
} from './schema';

const IdParams = z.object({
  id_type: IdType,
  id_number: userSchema.shape.id_number
});

type UserIdParams = z.infer<typeof IdParams> & { user_id: number };

const SQL_UPDATE_ID_NUMBER = sql<UserIdParams, Pick<UserIdParams,'id_number'>>(`
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
    request: {
      params:userIdParamsSchema,
      body: IdParams
    },
    response: {
      200: {
        schema: z.object({
          id_number: userSchema.shape.id_number
        })
      },
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const userId = Number(req.params.user_id);
      const {id_number}= await SQL_UPDATE_ID_NUMBER({
        user_id: userId,
        id_type: req.body.id_type,
        id_number: req.body.id_number
      }).one();

      res.json({id_number});
    }
  });
};

export default updateIdDetails;