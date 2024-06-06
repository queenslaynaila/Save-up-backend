import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { IdParamInterface } from '../../globalTypes/index';
import { GetGroupMembersInterface} from './types';

const SQL_GET_GROUP_MEMBERS = sql<{ group_id: number}, GetGroupMembersInterface>(`
  SELECT get_group_members(:group_id)
`);

export default (router: Router) => {
  router.get<IdParamInterface, GetGroupMembersInterface[], Record<string,never>, Record<string,never>>(
    '/:id',
    authMiddleware(),
    async (req, res) => {
      const  group_id  = parseInt(req.params.id); 
      const members = await SQL_GET_GROUP_MEMBERS({ group_id}).many();
      return res.json(members);
    }
  );
};