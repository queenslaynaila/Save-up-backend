import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { IdParamInterface } from '../../globalTypes/index';
import { CommonGroupInterface, SharedGroupInterface  } from './types';

const SQL_GET_COMMON_GROUPS = sql<SharedGroupInterface, CommonGroupInterface>(`
    SELECT g.id AS group_id, g.group_name, g.description
    FROM user_groups ug1
    INNER JOIN user_groups ug2 ON ug1.group_id = ug2.group_id
    INNER JOIN groups g ON ug1.group_id = g.id
    WHERE ug1.user_id = :loggedInUserId AND ug2.user_id = :userId2
`);

export default (router: Router) => {
  router.get<IdParamInterface, CommonGroupInterface[], Record<string,never>, Record<string,never>>(
    '/common-groups/:id',
    authMiddleware(),
    async (req, res) => {
      const loggedInUserId = req.user!.id;
      const userId = parseInt(req.params.id);
      const commonGroups = await SQL_GET_COMMON_GROUPS({ loggedInUserId, userId }).many();
      return res.json(commonGroups);
    });
};
