import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import { publicUserSchema, UserWithPublicAttributes } from '../auth/login';
import { UserRole } from './schema';

const SQL_GET_MODERATORS = sql<{role:string}, UserWithPublicAttributes>(`
    SELECT 
        users.id,
        users.id_type,
        users.id_number,
        user_contact_details.full_name,
        users.role,
        users.country,
        users.gender,
        user_contact_details.phone_number,
        users.created_at
    FROM users
    LEFT JOIN user_contact_details 
        ON users.id = user_contact_details.id
    WHERE users.role = :role
`);

const getModerators = (router: Router) => {
  router.get({
    path: '/moderators',
    summary: 'Get list of moderators',
    auth: UserRole.Enum.Admin,
    response: {
      schema: z.array(publicUserSchema)
    },
    handler: async (_req, res) => {
      const moderators = await SQL_GET_MODERATORS({
        role: 'Moderator'
      }).many();
      return res.json(moderators);
    }
  });
};

export default getModerators;