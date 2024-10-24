import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { GroupExitInterface, UserLeft } from './types';
import { IdParamInterface } from '../../globalTypes';

const SQL_EXIT_GROUP = sql<GroupExitInterface, UserLeft >(`
  SELECT * FROM leave_group (:id, :user_id);
`);

export default (router: Router) => {
  router.delete<IdParamInterface, UserLeft, GroupExitInterface,
  Record<string, never>>(
    '/:id',
    authMiddleware(),
    async (req, res) => {
      const name = await SQL_EXIT_GROUP({
        user_id: req.user!.id,
        id: Number(req.params.id)
      }).one();
      res.json(name);
    }
  );
};