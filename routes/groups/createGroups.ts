import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { GroupCreationInterface, groupCreationValidation, BaseGroupInterface} from './types';

const SQL_CREATE_GROUP = sql<GroupCreationInterface, BaseGroupInterface>(`
    SELECT * FROM create_group(:name, :created_by )
`);

export default (router: Router) => {
  router.post<Record<string,never>, BaseGroupInterface, GroupCreationInterface, Record<string,never>, Record<string,never>>(
    '/',
    authMiddleware(),
    validateRequest(groupCreationValidation),
    async (req, res) => {
      const group = await SQL_CREATE_GROUP({ ...req.body, created_by: req.user!.id}).one();
      res.json(group)
    }
  );
};