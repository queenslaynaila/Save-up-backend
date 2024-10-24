import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import {
  GroupsByUserInterface,
  groupsByUserSchema,
  RemovedMember,
  RemoveMemberInterface
} from './types';
import { IdParamInterface } from '../../globalTypes';
import validateRequest from '../../middleware/validationMiddleware';

const SQL_REMOVE_GROUP_MBR = sql<RemoveMemberInterface, RemovedMember>(`
  SELECT * FROM remove_user_from_group (:id, :admin_id, :user_id);
`);

export default (router: Router) => {
  router.delete<IdParamInterface, RemovedMember, GroupsByUserInterface,
  Record<string, never>>(
    '/remove-member/:id',
    validateRequest({
      body: groupsByUserSchema
    }),
    authMiddleware(),
    async (req, res) => {
      const response = await SQL_REMOVE_GROUP_MBR({
        admin_id: req.user!.id,
        user_id: req.body.user_id,
        id: Number(req.params.id)
      }).one();
      res.json(response);
    }
  );
};