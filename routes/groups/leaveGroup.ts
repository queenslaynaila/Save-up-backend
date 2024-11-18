import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { GroupExitInterface, groupExitSchema, UserLeft, userLeftSchema } from './types';
import { z } from 'zod';

const SQL_EXIT_GROUP = sql<GroupExitInterface, UserLeft >(`
  SELECT * FROM leave_group (:id, :user_id);
`);

const leaveGroup = (router:Router) => {
  router.route({
    method: 'delete',
    path: '/:id',
    summary: 'Exit a group',
    schema: {
      params: z.object({
        id: z.string()
      }),
      body: groupExitSchema
    },
    response: {
      schema: userLeftSchema
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const name = await SQL_EXIT_GROUP({
        user_id: req.user!.id,
        id: Number(req.params.id)
      }).one();
      res.json(name);
    }
  });
};

export default leaveGroup;