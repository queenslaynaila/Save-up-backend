import { z } from 'zod';
import { sql } from '../../db';
import { UserRole } from './schema';
import Router from '../../router';

const convertToTitleCase = (str: string): string => {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

const SQL_UPDATE_ROLE = sql<{
  targetUserId: number;
  role: string;
  adminId: number;
}, Record<string,never>>(`
  SELECT update_user_role(:targetUserId, :role, :adminId)
`);

const updateUserRole = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/:user_id/role',
    summary: 'Update user role.Admin only',
    request: {
      params: z.object({
        user_id: z.string()
      }),
      body: z.object({
        role: UserRole
      })
    },
    authMiddlewareOptions: {
      roles: [UserRole.Enum.Admin]
    },
    handler: async (req, res) => {
      const role = convertToTitleCase(req.body.role);
      const targetUserId = Number(req.params.user_id);
      
      await SQL_UPDATE_ROLE({
        targetUserId,
        role,
        adminId: req.user!.id
      }).exec();

      res.sendStatus(204);
    }
  });
};

export default updateUserRole;