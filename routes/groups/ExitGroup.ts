import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { validateRequest } from '../../middleware/validationMiddleware';
import { ExitGroupInterface, ExitGroupSchema } from '../../types';

const SQL_EXIT_GROUP = sql<ExitGroupInterface, { message: string }>(`
  DELETE FROM user_groups
  WHERE user_id = :user_id AND group_id = :group_id;
`);

export default (router: Router) => {
  router.delete<Record<string, never>, { message: string }, ExitGroupInterface, Record<string, never>, Record<string, never>>(
    '/',
    authMiddleware(),
    validateRequest(ExitGroupSchema),
    async (req, res) => {
      const user_id = req.user!.id;
      const { group_id } = req.body;
      await SQL_EXIT_GROUP({ user_id, group_id }).exec();
      res.json({ message: 'Exited group successfully' });
    }
  );
};
