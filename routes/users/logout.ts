import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { StatusCodeInterface } from '../../globalTypes/index';

const SQL_UPDATE_SESSION = sql<{user_id: number}, Record<string,never>>(`
  UPDATE sessions
  SET exited_at = NOW()
  WHERE user_id = :user_id
  AND exited_at IS NULL
`);

export default (router: Router) => {
  router.delete<Record<string, never>, StatusCodeInterface, Record<string, never>, Record<string, never>, Record<string, never>>(
    '/logout',
    authMiddleware(),
    async (req, res) => {
      await SQL_UPDATE_SESSION({ user_id:req.user!.id}).exec();
      res.removeHeader('authorization-token');
      res.removeHeader('refresh-token');
      res.sendStatus(204);
    }
  );
};