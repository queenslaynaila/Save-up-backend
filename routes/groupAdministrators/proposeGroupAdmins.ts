import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { IdParamInterface, MessageInterface } from '../../globalTypes/index';
import { ProposeAdminInterface, UserInterface } from './types'

const SQL_NOMINATE_GROUP_ADMIN = sql<ProposeAdminInterface, Record<string,never>>(`
  INSERT INTO nominated_administrators (group_id, user_id)
  VALUES (:group_id, :user_id)
  RETURNING *;
`);

export default (router: Router) => {
  router.post<IdParamInterface, MessageInterface, UserInterface, Record<string,never>, Record<string,never>>(
    '/nominate/:id',
    authMiddleware(),
    async (req, res) => {
      const { user_id } = req.body;
      const  group_id  = parseInt(req.params.id);
      await SQL_NOMINATE_GROUP_ADMIN({ user_id, group_id }).exec();
      res.json({ message: 'Member nominated as admin ' });
    }
  );
};
