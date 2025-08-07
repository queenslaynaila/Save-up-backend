import { z } from 'zod';
import { sql } from '../../db';
import { AccountStatus, UserRole } from './schema';
import Router from '../../core/router';
import HttpError from '../../httpError';
import { decodeParamsAndAuthorizeAccess } from '../../decodeParamsAndAuthorizeAccess';

const SQL_UPDATE_STATUS = sql<
Pick<AccountStatus, 'user_id' | 'status' | 'admin_id' | 'reason'>,
Pick<AccountStatus, 'status'>
>(`
  INSERT INTO account_status_updates (
    user_id,
    xid,
    admin_id,
    status,
    reason
  )
  SELECT 
    :user_id,
    COALESCE(MAX(xid), 0) + 1,
    :admin_id,
    :status,
    :reason
  FROM account_status_updates
  WHERE user_id = :user_id
  RETURNING status
`);

const updateUserStatus = (router: Router) => {
  router.patch({
    path: '/:user_id/status',
    summary: 'Update user  status',
    auth: [UserRole.enum.Admin, UserRole.enum.Moderator],
    schema: {
      params: z.object({
        user_id: z.number().int().min(1)
      }),
      body: z.object({
        status: z.enum(['Active', 'Inactive', 'Suspended']),
        reason: z.string().optional()
      })
    },
    response: {
      schema: z.object({
        status: z.enum(['Active', 'Inactive', 'Suspended'])
      })
    },
    handler: async (req, res) => {
      const userId = await decodeParamsAndAuthorizeAccess(req, true);

      if (req.user!.id === userId) {
        throw new HttpError(403, {
          message: 'ERR_CANT_ACT_ON_SELF'
        });
      }

      const status = await SQL_UPDATE_STATUS({
        user_id: userId,
        status: req.body.status,
        admin_id: req.user!.id,
        reason: req.body.reason
      }).oneFirst();

      res.json({ status });
    }
  });
};

export default updateUserStatus;