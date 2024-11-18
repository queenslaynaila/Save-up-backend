import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import {
  groupsByUserSchema,
  RemovedMember,
  removedMemberSchema,
  RemoveMemberInterface
} from './types';
import { z } from 'zod';

const SQL_REMOVE_GROUP_MBR = sql<RemoveMemberInterface, RemovedMember>(`
  SELECT * FROM remove_user_from_group (:id, :admin_id, :user_id);
`);

const removeMember = (router:Router) => {
  router.route({
    method: 'delete',
    path: '/remove_member/:id',
    summary: 'Remove a group member',
    schema: {
      params: z.object({
        id: z.string()
      }),
      body: groupsByUserSchema
    },
    response: {
      schema: removedMemberSchema
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const response = await SQL_REMOVE_GROUP_MBR({
        admin_id: req.user!.id,
        user_id: req.body.user_id,
        id: Number(req.params.id)
      }).one();
      res.json(response);
    }
  });
};

export default removeMember;