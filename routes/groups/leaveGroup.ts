import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { GroupExitInterface } from './types';
import { StatusCodeInterface, IdParamInterface } from '../../globalTypes/index';

const SQL_EXIT_GROUP = sql<GroupExitInterface , Record<string,never>>(`
  SELECT leave_group (:user_id, :id, :reason);
`);

export default (router: Router) => {
  router.delete<IdParamInterface, StatusCodeInterface, GroupExitInterface, Record<string,never>, Record<string,never>>(
    '/:id',
    authMiddleware(),
    async (req, res) => {
      const user_id = req.user!.id;
      const  id  = parseInt(req.params.id); 
      await SQL_EXIT_GROUP({...req.body, user_id, id }).exec();
      res.sendStatus(204);
    }
  );
};