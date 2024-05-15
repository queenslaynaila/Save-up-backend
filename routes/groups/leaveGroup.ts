import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { ExitGroupInterface, exitGroupSchema } from './types';
import { MessageInterface, IdParamInterface } from '../../globalTypes/index';

const SQL_EXIT_GROUP = sql<ExitGroupInterface, Record<string,never>>(`
  UPDATE user_groups
  SET left_at = NOW()
  WHERE user_id = :user_id AND group_id = :group_id;
`);

export default (router: Router) => {
  router.patch<IdParamInterface, MessageInterface, Record<string,never>, Record<string,never>, Record<string,never>>(
    'exit-group/:id',
    authMiddleware(),
    validateRequest(exitGroupSchema),
    async (req, res) => {
      const user_id = req.user!.id;
      const  group_id  = parseInt(req.params.id); 
      await SQL_EXIT_GROUP({ user_id, group_id }).exec();
      res.json({ message: 'Exited group successfully' });
    }
  );
};