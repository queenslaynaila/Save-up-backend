import { z } from 'zod';
import { sql } from '../../db';
import { UserRole } from './schema';
import Router from '../../router';
import HttpError from '../../httpError';

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

      if (req.user!.id === targetUserId) {
        throw new HttpError(403, { message: 'ERR_CANT_ACT_ON_SELF' });
      }
      
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