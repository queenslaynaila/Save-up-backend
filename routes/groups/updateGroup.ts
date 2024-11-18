import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import {
  groupCreationValidation,
  GroupUpdateInterface,
  groupUpdateSchema
} from './types';
import { z } from 'zod';

const SQL_UPDATE_GROUP = sql<GroupUpdateInterface, GroupUpdateInterface>(`
   SELECT * FROM update_group_name(:id, :user_id, :name)
`);

const updateGroup = (router:Router) => {
  router.route({
    method: 'patch',
    path: '/:id',
    summary: 'Update group details',
    schema: {
      params: z.object({
        id: z.string()
      }),
      body: groupCreationValidation
    },
    response: {
      schema: groupUpdateSchema
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const updatedGroup = await SQL_UPDATE_GROUP({
        ...req.body,
        id: Number(req.params.id),
        user_id: req.user!.id
      }).one();
      res.json(updatedGroup);
    }
  });
};

export default updateGroup;
