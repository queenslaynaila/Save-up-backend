import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { CreateGroupInterface, CreateGroupResponseInterface, baseGroupSchema } from './types';

const SQL_CREATE_GROUP = sql<CreateGroupInterface, CreateGroupResponseInterface>(`
    SELECT create_group(:group_name, :created_by )
`);

export default (router: Router) => {
  router.post<Record<string,never>, CreateGroupResponseInterface, CreateGroupInterface, Record<string,never>, Record<string,never>>(
    '/',
    authMiddleware(),
    validateRequest(baseGroupSchema),
    async (req, res) => {
      const user_id= req.user!.id
      const { group_name } = req.body;
      const group = await SQL_CREATE_GROUP({ group_name, created_by: user_id }).one();
      res.json(group)
    }
  );
};