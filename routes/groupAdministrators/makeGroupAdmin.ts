import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { MessageInterface } from '../../globalTypes/index'
import { UserInterface, GroupInterface, ProposeAdminInterface} from './types'

const SQL_CREATE_GROUP_ADMIN = sql<ProposeAdminInterface, Record<string,never>>(`
  INSERT INTO group_administrators (group_id, user_id)
  VALUES (:groupId, :userId)
  RETURNING *;
`);

export default (router: Router) => {
  router.post<GroupInterface, MessageInterface, UserInterface, Record<string,never>, Record<string,never>>(
    '/:groupId',
    authMiddleware(),
    async (req, res) => {
      const { userId } = req.body;
      const groupId  = parseInt(req.params.groupId);
      await SQL_CREATE_GROUP_ADMIN({ userId, groupId }).exec();
      res.json({ message: 'Group admin created successfully' });
    }
  );
};
