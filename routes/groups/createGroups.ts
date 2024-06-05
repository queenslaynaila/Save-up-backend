import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { CreateGroupInterface, GroupInterface, createGroupSchema } from './types';

const SQL_CREATE_GROUP = sql<CreateGroupInterface, GroupInterface>(`
    SELECT create_group(:group_name, :created_by )
`);

export default (router: Router) => {
  router.post<Record<string,never>, GroupInterface, CreateGroupInterface, Record<string,never>, Record<string,never>>(
    '/',
    authMiddleware(),
    validateRequest(createGroupSchema),
    async (req, res) => {
      const group = await SQL_CREATE_GROUP({ ...req.body, created_by: req.user!.id}).one();
      res.json(group)
    }
  );
};