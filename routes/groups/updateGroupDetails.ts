import { Router } from 'express';
import { sql } from '../../db';
import  authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { UpdateGroupInterface, UpdateGroupResponseInterface, baseGroupSchema } from './types';
import { IdParamInterface } from '../../globalTypes/index';

const SQL_UPDATE_GROUP = sql<UpdateGroupInterface, UpdateGroupResponseInterface>(`
  UPDATE groups
  SET group_name = COALESCE(:name, name),
  WHERE id = :group_id
  RETURNING name;
`);

export default (router: Router) => {
  router.patch<IdParamInterface, UpdateGroupResponseInterface, UpdateGroupInterface, Record<string,never>, Record<string,never>>(
    '/:id',
    authMiddleware(),
    validateRequest(baseGroupSchema),
    async (req, res) => {
      const updatedGroup = await SQL_UPDATE_GROUP({ ...req.body, group_id: parseInt(req.params.id)}).one();
      res.json(updatedGroup);
    }
  );
};
