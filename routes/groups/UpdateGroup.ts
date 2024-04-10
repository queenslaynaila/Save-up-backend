import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { validateRequest } from '../../middleware/validationMiddleware';
import { UpdateGroupInterface,  UpdateGroupResponseInterface ,UpdateGroupSchema} from '../../types';

const SQL_UPDATE_GROUP = sql<UpdateGroupInterface, UpdateGroupResponseInterface>(`
  UPDATE groups
  SET group_name = COALESCE(:group_name, group_name),
      description = COALESCE(:description, description)
  WHERE id = :group_id
  RETURNING group_name, description;
`);

export default (router: Router) => {
  router.patch<{ groupId: string }, UpdateGroupResponseInterface, UpdateGroupInterface, Record<string, never>, Record<string, never>>(
    '/:groupId',
    authMiddleware(),
    validateRequest(UpdateGroupSchema),
    async (req, res) => {
      const { groupId } = req.params; 
      const { group_name, description } = req.body;
      const updatedGroup = await SQL_UPDATE_GROUP({ group_id: parseInt(groupId), group_name, description }).one();
      res.json(updatedGroup);
    }
  );
};

