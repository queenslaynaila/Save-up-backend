import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { validateRequest } from '../../middleware/validationMiddleware';
import { HttpError } from '../../middleware/errorMiddleware';
import { UpdateGroupInterface, UpdateGroupSchema } from '../../types';

const SQL_UPDATE_GROUP = sql<UpdateGroupInterface, { message: string }>(`
  UPDATE groups
  SET name = COALESCE(:name, name),
      description = COALESCE(:description, description)
  WHERE id = :group_id
  RETURNING id;
`);

export default (router: Router) => {
  router.put<Record<string, never>, { message: string }, UpdateGroupInterface, Record<string, never>, Record<string, never>>(
    '/update_group',
    authMiddleware(),
    validateRequest(UpdateGroupSchema),
    async (req, res) => {
      const { group_id, name, description } = req.body;
      const updatedGroup = await SQL_UPDATE_GROUP({ group_id, name, description }).oneOrNull();
      if (!updatedGroup) {
        throw new HttpError(404, 'Group not found');
      }
      res.json({ message: 'Group updated successfully' });
    }
  );
};
