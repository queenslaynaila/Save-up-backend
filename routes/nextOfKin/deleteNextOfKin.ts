import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import { verifyPin } from '../../utils';

const SQL_DELETE_KIN = sql<
  { user_id: number, xid: number },
  Record<string, never>
>(`
  UPDATE next_of_kins  
  SET deleted_at = NOW()
  WHERE user_id = :user_id
    AND xid = :xid
    AND deleted_at IS NULL;
`);

const deleteNextOfKin = (router: Router) => {
  router.route({
    method: 'delete',
    path: '/:xid',
    summary: 'Delete a next of kin',
    auth: true,
    schema: {
      params: z.object({
        xid: z.number().int().min(1)
      }),
      body: z.object({
        pin: z.string().regex(/^\d{4}$/)
      })
    },
    middlewares: [verifyPin],
    handler: async (req, res) => {
      await SQL_DELETE_KIN({
        user_id: req.user!.id,
        xid:req.params.xid
      }).exec();
      
      res.sendStatus(204);
    }
  });
};

export default deleteNextOfKin;