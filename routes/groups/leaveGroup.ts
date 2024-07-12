import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { GroupExitInterface } from './types';
import { StatusCodeInterface, IdParamInterface, headersSchema } from '../../globalTypes/index';
import validateRequest from '../../middleware/validationMiddleware';

const SQL_EXIT_GROUP = sql<GroupExitInterface, Record<string,never>>(`
  SELECT leave_group (:user_id, :id);
`);

export default (router: Router) => {
  router.delete<IdParamInterface, StatusCodeInterface, GroupExitInterface,
  Record<string,never>>(
    '/:id',
    validateRequest({
      headers: headersSchema, 
    }),
    authMiddleware(),
    async (req, res) => {
      await SQL_EXIT_GROUP({
        user_id: req.user!.id, 
        id: parseInt(req.params.id) 
      }).exec();
      res.sendStatus(204);
    }
  );
};