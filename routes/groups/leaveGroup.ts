import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { ExitGroupInterface, exitGroupSchema } from './types';
import { StatusCodeInterface, IdParamInterface } from '../../globalTypes/index';

const SQL_EXIT_GROUP = sql<ExitGroupInterface, Record<string,never>>(`
  UPDATE user_groups
  SET left_at = NOW()
  WHERE user_id = :user_id 
  AND group_id = :group_id
  AND left_at IS NULL;
`);

export default (router: Router) => {
  router.delete<IdParamInterface, StatusCodeInterface, Record<string,never>, Record<string,never>, Record<string,never>>(
    '/:id',
    authMiddleware(),
    validateRequest(exitGroupSchema),
    async (req, res) => {
      const user_id = req.user!.id;
      const  group_id  = parseInt(req.params.id); 
      await SQL_EXIT_GROUP({ user_id, group_id }).exec();
      res.sendStatus(201);
    }
  );
};