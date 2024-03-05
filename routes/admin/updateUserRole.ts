import { Router } from 'express';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import { UserSchema } from '../../routes/users/index';
import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';

const VALID_ROLES = ['admin', 'user', 'moderator'];

const SQL_UPDATE_ROLE = sql<{ roleToUpdate: string, id: string }, UserSchema>(`UPDATE users SET role = :roleToUpdate WHERE id = :id`);

export default (router: Router) => {
  router.patch('/:roleToUpdate/:id', authMiddleware({ roles: [UserRole.ADMIN] }), async (req, res) => {
    let { roleToUpdate } = req.params;
    const { id } = req.params;
    roleToUpdate = roleToUpdate.toLowerCase();
    if (!VALID_ROLES.includes(roleToUpdate)) {
      throw new HttpError(400, 'Invalid role.');
    }
    console.log(SQL_UPDATE_ROLE({ id, roleToUpdate }));
    const result = await SQL_UPDATE_ROLE({  roleToUpdate ,id}).one();
    res.json(result);
  });
};
