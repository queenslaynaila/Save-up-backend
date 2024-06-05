import { Router } from 'express';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/authorization';
import { convertToTitleCase } from '../../middleware/caseNormalization';
import { UserRoleUpdateInterface, RoleUpdateResultInterface } from '../admin/types';
import { UserRole } from '../../globalTypes/index';

const VALID_ROLES = ['Admin', 'User', 'Moderator'];

const SQL_UPDATE_ROLE = sql<UserRoleUpdateInterface, RoleUpdateResultInterface>(`
  UPDATE users 
  SET role = :role 
  WHERE id = :id 
  RETURNING id, full_name, gender, role
`);

export default (router: Router) => {
  router.patch<UserRoleUpdateInterface, RoleUpdateResultInterface, Record<string,never>, Record<string,never>>(
    '/:id/:role',
    authMiddleware({ roles: [UserRole.ADMIN] }),
    async (req, res) => {
      const  role  =  convertToTitleCase(req.params.role);
      const  id  = req.params.id;
      if (!VALID_ROLES.includes(role)) {
        throw new HttpError(400, 'Invalid role.');
      }
      const result = await SQL_UPDATE_ROLE({ role, id })
        .one(new HttpError (404, 'User with given ID not found.'));
      res.json(result);
    }
  );
};
