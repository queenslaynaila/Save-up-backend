import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { UpdateGroupInterface, UpdateGroupResponseInterface, baseGroupSchema } from './types';
import { IdParamInterface } from '../../globalTypes/index';

const SQL_UPDATE_GROUP = sql<UpdateGroupInterface, UpdateGroupResponseInterface>(`
  UPDATE groups
  SET group_name = COALESCE(:group_name, group_name),
      description = COALESCE(:description, description)
  WHERE id = :group_id
  RETURNING group_name, description;
`);

export default (router: Router) => {
  router.patch<IdParamInterface, UpdateGroupResponseInterface, UpdateGroupInterface, Record<string,never>, Record<string,never>>(
    '/:groupId',
    authMiddleware(),
    validateRequest(baseGroupSchema),
    async (req, res) => {
      const groupId = parseInt(req.params.id);
      const { group_name, description } = req.body;
      const updatedGroup = await SQL_UPDATE_GROUP({ group_id: groupId, group_name, description }).one();
      res.json(updatedGroup);
    }
  );
};

