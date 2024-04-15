import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { ExitGroupInterface, ExitGroupSchema } from '../../types';

const SQL_EXIT_GROUP = sql< ExitGroupInterface, Record<string, never>>(`
  UPDATE user_groups
  SET left_at = NOW()
  WHERE user_id = :user_id AND group_id = :group_id;
`);


export default (router: Router) => {
  router.patch<{ groupId: string }, { message: string }, Record<string, never>, Record<string, never>, Record<string, never>>(
    'exit-group/:groupId',
    authMiddleware(),
    validateRequest(ExitGroupSchema),
    async (req, res) => {
      const user_id = req.user!.id;
      const { groupId } = req.params; 
      await SQL_EXIT_GROUP({ user_id, group_id: parseInt(groupId) }).exec();
      res.json({ message: 'Exited group successfully' });
    }
  );
};
