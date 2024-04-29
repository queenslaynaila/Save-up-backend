import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { ExitGroupInterface, exitGroupSchema } from './types';
import { MessageInterface, IdParamInterface } from '../../globalTypes/index';

const SQL_EXIT_GROUP = sql<ExitGroupInterface, Record<string,never>>(`
  UPDATE user_groups
  SET left_at = NOW()
  WHERE user_id = :userId AND group_id = :groupId;
`);


export default (router: Router) => {
  router.patch<IdParamInterface, MessageInterface, Record<string,never>, Record<string,never>, Record<string,never>>(
    'exit-group/:groupId',
    authMiddleware(),
    validateRequest(exitGroupSchema),
    async (req, res) => {
      const userId = req.user!.id;
      const  groupId  = parseInt(req.params.id); 
      await SQL_EXIT_GROUP({ userId, groupId }).exec();
      res.json({ message: 'Exited group successfully' });
    }
  );
};
