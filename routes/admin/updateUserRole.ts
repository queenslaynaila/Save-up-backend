import { Router } from 'express';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/auth';
import { convertToTitleCase } from '../../middleware/caseNormalization';
import { UserRole ,UpdatedUserRoleInterface } from '../../types';

const VALID_ROLES = ['Admin', 'User', 'Moderator'];

const SQL_UPDATE_ROLE = sql<{ roleToUpdate: string; id: string }, UpdatedUserRoleInterface>(`
  UPDATE users 
  SET role = :roleToUpdate 
  WHERE id = :id 
  RETURNING id, full_name, gender, role
`);

export default (router: Router) => {
  router.patch<
  { roleToUpdate: string; id: string }, 
  UpdatedUserRoleInterface, 
  Record<string, never>, 
  Record<string, never>>(
    '/:roleToUpdate/:id',
    authMiddleware({ roles: [UserRole.ADMIN] }),
    async (req, res) => {
      const  roleToUpdate  =  convertToTitleCase(req.params.roleToUpdate);
      const  id  = req.params.id;
      if (!VALID_ROLES.includes(roleToUpdate)) {
        throw new HttpError(400, 'Invalid role.');
      }
      const result = await SQL_UPDATE_ROLE({ roleToUpdate, id })
        .one(new HttpError (404, 'User with given ID not found.'));
      res.json(result);
    }
  );
};
