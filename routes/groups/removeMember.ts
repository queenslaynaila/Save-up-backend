import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { 
  GroupsByUserInterface, 
  groupsByUserSchema, 
  RemoveMemberInterface 
} from './types';
import { StatusCodeInterface, IdParamInterface, } from '../../globalTypes/index';
import validateRequest from '../../middleware/validationMiddleware';

const SQL_REMOVE_GROUP_MBR = sql<RemoveMemberInterface, Record<string,never>>(`
  SELECT remove_user_from_group (:admin_id, :user_id, :id);
`);

export default (router: Router) => {
  router.delete<IdParamInterface, StatusCodeInterface, GroupsByUserInterface, 
  Record<string,never>>(
    '/remove-member/:id',
    validateRequest({
      body: groupsByUserSchema
    }),
    authMiddleware(),
    async (req, res) => {
      await SQL_REMOVE_GROUP_MBR({
        admin_id: req.user!.id, 
        user_id: req.body.user_id,
        id: parseInt(req.params.id) 
      }).exec();
      res.sendStatus(204);
    }
  );
};