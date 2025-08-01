import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../core/router';
import { UserRole } from './schema';
import HttpError from '../../httpError';

const SQL_GET_RECENT_UNLOCK = sql<{user_id:number}, {xid:number}>(`
    SELECT xid 
    FROM login_attempts 
    WHERE user_id = :user_id 
    AND reason = 'Locked' 
    AND success = false
    ORDER BY created_at DESC 
    LIMIT 1;
`);

const SQL_UNLOCK_USER_ACCOUNT = sql<{
  user_id:number
  admin_id:number
  locked_attempt_id:number
  reason?:string
}, Record<string, never>>(`
   INSERT INTO account_unlocks (user_id, admin_id, locked_attempt_id,reason)
   VALUES (
         :user_id,
         :admin_id,
         :locked_attempt_id,
         :reason
   )
   
`);

const unlockUserAccount = (router: Router) => {
  router.patch({
    path: '/:user_id/unlock',
    summary: 'Unlock a locked user account.',
    auth: [UserRole.Enum.Moderator, UserRole.Enum.Admin],
    schema: {
      params: z.object({
        user_id: z.number().int().min(1)
      }),
      body: z.object({
        notes: z.string().optional()
      })
    },
    response: {
      statusCode: 200
    },
    handler: async (req, res) => {
      await sql.transaction(async (trx) => {
        const locked_attempt_id = await SQL_GET_RECENT_UNLOCK({
          user_id: req.params.user_id
        }).using(trx)
          .oneFirst(new HttpError(404, { message: 'ERR_ACCOUNT_IS_NOT_LOCKED' }));

        await SQL_UNLOCK_USER_ACCOUNT({
          user_id: req.params.user_id,
          admin_id: req.user!.id,
          locked_attempt_id,
          reason: req.body.notes
        }).using(trx)
          .exec();
      });
      res.status(200);
    }
  });
};

export default unlockUserAccount;