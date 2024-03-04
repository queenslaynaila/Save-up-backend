import { Router } from 'express';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import { UserSchema } from '../../routes/users/index';
import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';

const VALID_ROLES = ['admin', 'user','moderator'];

const SQL_UPDATE_ROLE = sql<{ userId: string, roleToUpdate: string }, UserSchema>(`UPDATE users SET role =:roleToUpdate WHERE id = :userId`);

export default (router: Router) => {
  router.patch('/:roleToUpdate',authMiddleware({roles: [UserRole.ADMIN]}), async (req, res) => {
    const { roleToUpdate } = req.params;
    const { userId } = req.body;
    if (!VALID_ROLES.includes(roleToUpdate.toLowerCase() )) {
      throw new HttpError(400, 'Invalid role.');
    }
    const result = await SQL_UPDATE_ROLE({userId,roleToUpdate}).one();
    res.json(result);
  });
};
