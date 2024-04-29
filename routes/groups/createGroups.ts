import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { CreateGroupInterface, CreateGroupResponseInterface, baseGroupSchema, EntityTypeInterface, IdRequestInterface } from './types';

const SQL_CREATE_GROUP_ENTITY = sql<EntityTypeInterface, IdRequestInterface>(`
  INSERT INTO entities (entity_type)
  VALUES (:entityType)
  RETURNING id
`);

const SQL_CREATE_GROUP = sql<CreateGroupInterface, CreateGroupResponseInterface>(`
  INSERT INTO groups (id, group_name, description, created_by)
  VALUES (:id, :groupName, :description, :createdBy)
  RETURNING id, groupName, description, createdBy, createdAt, updatedAt
`);

export default (router: Router) => {
  router.post<Record<string,never>, CreateGroupResponseInterface, CreateGroupInterface, Record<string,never>, Record<string,never>>(
    '/',
    authMiddleware(),
    validateRequest(baseGroupSchema),
    async (req, res) => {
      const userId= req.user!.id
      const entity = await SQL_CREATE_GROUP_ENTITY({ entityType: 'Groups' }).one();
      const { groupName, description} = req.body;
      const group = await SQL_CREATE_GROUP({ id:entity.id, groupName, description, createdBy: userId }).one();
      res.json(group)
    }
  );
};
