import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import { publicUserSchema, UserWithPublicAttributes } from '../auth/login';

const SQL_GET_USER_BY_CRITERIA = sql<{user_id:number}, UserWithPublicAttributes>(`
  SELECT 
    users.id, 
    users.id_type, 
    users.id_number,
    user_contact_details.full_name, 
    users.role, 
    users.gender, 
    user_contact_details.phone_number,  
    users.created_at
  FROM 
    users
  LEFT JOIN 
    user_contact_details ON users.id = user_contact_details.id
  WHERE users.id = :user_id
`);

const getUsersByUserId = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:user_id',
    summary: 'Get user by user ID',
    request: {
      params: z.object({
        user_id: z.string().optional(),
      }).partial()
    },
    response: {
      200: {
        schema: publicUserSchema
      }
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const user = await SQL_GET_USER_BY_CRITERIA({
        user_id: req.user!.id
      }).one();

      res.json(user);
    }
  });
};

export default getUsersByUserId;