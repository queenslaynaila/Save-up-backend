import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { GroupExitInterface } from './types';
import { StatusCodeInterface, IdParamInterface } from '../../globalTypes/index';

const SQL_EXIT_GROUP = sql<GroupExitInterface , Record<string,never>>(`
  UPDATE group_users
  SET left_at = NOW()
  WHERE user_id = :user_id 
  AND id = :id
  AND left_at IS NULL;
`);

export default (router: Router) => {
  router.delete<IdParamInterface, StatusCodeInterface, Record<string,never>, Record<string,never>, Record<string,never>>(
    '/:id',
    authMiddleware(),
    async (req, res) => {
      const user_id = req.user!.id;
      const  id  = parseInt(req.params.id); 
      await SQL_EXIT_GROUP({ user_id, id }).exec();
      res.sendStatus(204);
    }
  );
};