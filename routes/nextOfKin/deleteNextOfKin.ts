import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { z } from 'zod';

const SQL_DELETE_KIN = sql<{user_id: number, xid: number}, Record<string, never>>(`
  UPDATE next_of_kins  
  SET deleted_at = NOW()
  WHERE user_id = :user_id
  AND xid = :xid
  AND deleted_at IS NULL
`);

const deleteNextOfKin = (router: Router) => {
  router.route({
    method: 'delete',
    path: '/:xid',
    summary: 'Delete next of kin',
    schema: {
      params: z.object({ xid: z.string() })
    },
    response: {
      statusCode: 204
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      await SQL_DELETE_KIN({
        user_id: req.user!.id,
        xid: Number(req.params.xid)
      }).exec();
      res.sendStatus(204);
    }
  });
};

export default deleteNextOfKin;