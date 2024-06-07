import { Router } from 'express';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/authorization';
import { convertToTitleCase } from '../../middleware/caseNormalization';
import { UserRoleUpdateType, UserRoleParamType } from './types';
import { UserRole, StatusCodeInterface } from '../../globalTypes/index';

const VALID_ROLES = ['Admin', 'User', 'Moderator'];

const SQL_UPDATE_ROLE = sql<UserRoleUpdateType, Record<string,never>>(`
  UPDATE users 
  SET role = :role 
  WHERE id = :id 
`);

export default (router: Router) => {
  router.patch<UserRoleParamType, StatusCodeInterface, Record<string,never>, Record<string,never>>(
    '/:id/:role',
    authMiddleware({ roles: [UserRole.ADMIN] }),
    async (req, res) => {
      const  role  =  convertToTitleCase(req.params.role);
      const  id  = req.params.id;
      if (!VALID_ROLES.includes(role)) {
        throw new HttpError(400, 'Invalid role.');
      }
      await SQL_UPDATE_ROLE({ role, id }).exec();
      res.sendStatus(204);
    }
  );
};