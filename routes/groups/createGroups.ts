import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import validateRequest from '../../middleware/validationMiddleware';
import { 
  GroupCreationInterface, 
  groupCreationValidation, 
  BaseGroupInterface,
  GroupCreationValidation
} from './types';

const SQL_CREATE_GROUP = sql<GroupCreationInterface, BaseGroupInterface>(`
    SELECT * FROM create_group(:name, :created_by )
`);

export default (router: Router) => {
  router.post<Record<string,never>, BaseGroupInterface, GroupCreationValidation, 
  Record<string,never>>(
    '/',
    validateRequest({
      body: groupCreationValidation
    }),
    authMiddleware(),
    async (req, res) => {
      const group = await SQL_CREATE_GROUP({ 
        ...req.body,
        created_by: req.user!.id
      }).one();
      res.json(group)
    }
  );
};