import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { IdParamInterface, MessageInterface } from '../../globalTypes/index';
import { ProposeAdminInterface, UserInterface } from './types'

const SQL_NOMINATE_GROUP_ADMIN = sql<ProposeAdminInterface, Record<string,never>>(`
  INSERT INTO nominated_administrators (group_id, user_id)
  VALUES (:group_id, :user_id)
  RETURNING (SELECT full_name FROM users where id = :user_id) AS name
`);

export default (router: Router) => {
  router.post<IdParamInterface, MessageInterface, UserInterface, Record<string,never>, Record<string,never>>(
    '/nominate/:id',
    authMiddleware(),
    async (req, res) => {
      const { user_id } = req.body;
      const  group_id  = parseInt(req.params.id);
      const member = await SQL_NOMINATE_GROUP_ADMIN({ user_id, group_id }).one(
        new HttpError(400, `Member has already been nominated as admin`)
      );
      res.json({ message:  `You have nominated ${member.name} as an adminstrator`});
    }
  );
};