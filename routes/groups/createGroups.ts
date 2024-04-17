import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { CreateGroupInterface, CreateGroupResponseInterface, baseGroupSchema } from '../../types';

const SQL_CREATE_GROUP_ENTITY = sql<{entity_type: string }, { id:number }>(`
  INSERT INTO entities (entity_type)
  VALUES (:entity_type)
  RETURNING id
`);

const SQL_CREATE_GROUP = sql<CreateGroupInterface, CreateGroupResponseInterface>(`
  INSERT INTO groups (id,group_name,description,created_by)
  VALUES (:id,:group_name,:description,:created_by)
  RETURNING id,group_name,description,created_by,created_at,updated_at
`);

export default (router: Router) => {
  router.post<Record<string,never>, CreateGroupResponseInterface,CreateGroupInterface , Record<string,never>, Record<string,never>>(
    '/',
    authMiddleware(),
    validateRequest(baseGroupSchema),
    async (req, res) => {
      const user_id= req.user!.id
      const entity = await SQL_CREATE_GROUP_ENTITY({ entity_type: 'Groups' }).one();
      const { group_name, description} = req.body;
      const group = await SQL_CREATE_GROUP({ id:entity.id, group_name, description, created_by: user_id }).one();
      res.json(group)
    }
  );
};
