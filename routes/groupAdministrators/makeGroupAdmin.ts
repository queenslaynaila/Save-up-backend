import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { MessageInterface } from '../../globalTypes/index'
import { UserInterface, GroupInterface, ProposeAdminInterface} from './types'

const SQL_CREATE_GROUP_ADMIN = sql<ProposeAdminInterface, Record<string,never>>(`
  INSERT INTO group_administrators (group_id, user_id)
  VALUES (:group_id, :user_id)
  RETURNING *;
`);

export default (router: Router) => {
  router.post<GroupInterface, MessageInterface, UserInterface, Record<string,never>, Record<string,never>>(
    '/:group_id',
    authMiddleware(),
    async (req, res) => {
      const { user_id } = req.body;
      const group_id  = parseInt(req.params.group_id);
      await SQL_CREATE_GROUP_ADMIN({ user_id, group_id }).exec();
      res.json({ message: 'Group admin created successfully' });
    }
  );
};
