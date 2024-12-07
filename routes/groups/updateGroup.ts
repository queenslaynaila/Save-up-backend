import Router from '../../router';
import { sql } from '../../db';

import { z } from 'zod';

const SQL_UPDATE_GROUP = sql<{
  id: number;
  name: string;
  user_id: number;
}, {new_name:string}>(`
   SELECT * FROM update_group_name(:id, :user_id, :name)
`);

const updateGroup = (router:Router) => {
  router.route({
    method: 'patch',
    path: '/:id',
    summary: 'Update group details',
    request: {
      params: z.object({
        id: z.string()
      }),
      body: z.object({
        name: z.string()
      })
    },
    response: {
      200: {
        schema: z.object({
          new_name: z.string()
        })
      }
    },
    authMiddlewareOptions: {},
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
