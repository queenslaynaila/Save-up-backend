import { z } from 'zod';
import { sql } from '../../db';
import { UserRole } from './schema';
import Router from '../../router';
import HttpError from '../../httpError';
import { decodeEntityAndVerifyAccess } from '../../utils';

const convertToTitleCase = (str: string): string => {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

const SQL_UPDATE_ROLE = sql<
{
  targetUserId: number;
  role: string;
  adminId: number;
},
Record<string, never>
>(`
  SELECT update_user_role(
    :targetUserId,
    :role,
    :adminId
  )
`);

const updateUserStatus = (router: Router) => {
  router.patch({
    path: '/:user_id/status',
    summary: 'Update user  status',
    auth: [UserRole.enum.Admin, UserRole.enum.Moderator],
    schema: {
      params: z.object({
        user_id: z.number().int().min(1).describe('Numeric user Id')
      }),
      body: z.object({
        role: UserRole
      })
    },
    handler: async (req, res) => {
      const userId = await decodeEntityAndVerifyAccess(req, true);
      const role = convertToTitleCase(req.body.role);

      if (req.user!.id === userId) {
        throw new HttpError(403, {
          message: 'ERR_CANT_ACT_ON_SELF'
        });
      }

      await SQL_UPDATE_ROLE({
        targetUserId: userId,
        role,
        adminId: req.user!.id
      }).exec();

      res.sendStatus(204);
    }
  });
};

export default updateUserStatus;