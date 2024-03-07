import { Router } from 'express';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import { UserSchema } from '../../routes/users/index';
import authMiddleware from '../../middleware/auth';
import {convertToTitleCase} from '../../middleware/caseNormalization';
import { UserRole } from '../../types';

const VALID_ROLES = ['Admin', 'User', 'Moderator'];
const SQL_UPDATE_ROLE = sql<{ roleToUpdate: string, id: string }, UserSchema>(`
UPDATE users SET role = :roleToUpdate WHERE id = :id RETURNING id, first_name, last_name, role, created_at, updated_at`
);

export default (router: Router) => {
  router.patch('/:roleToUpdate/:id', authMiddleware({ roles: [UserRole.ADMIN] }), async (req, res) => {
    let { roleToUpdate } = req.params;
    const { id } = req.params;
    roleToUpdate = convertToTitleCase(roleToUpdate);
    if (!VALID_ROLES.includes(roleToUpdate)) {
      throw new HttpError(400, 'Invalid role.');
    }
    const result = await SQL_UPDATE_ROLE({  roleToUpdate ,id}).one();
    res.json(result);
  });
};
