import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import logger from '../../logger';
import HttpError from '../../httpError';

const SQL_UPDATE_GROUP = sql<
{ group_id: number; name: string; user_id: number;},
{ name:string }>(`
   SELECT * FROM update_group_name(:group_id, :user_id, :name)
`);

const updateGroup = (router:Router) => {
  router.route({
    method: 'patch',
    path: '/:group_id',
    summary: 'Update group details',
    request: {
      params: z.object({
        group_id: z.string()
      }),
      body: z.object({
        name: z.string()
      })
    },
    response: {
      200: {
        schema: z.object({
          name: z.string()
        })
      }
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      logger.info(`Updating group ${req.params.group_id} and name is ${req.body.name}`);
      const { name } = await SQL_UPDATE_GROUP({
        group_id: Number(req.params.group_id),
        user_id: req.user!.id,
        name: req.body.name
      }).one().catch((err) => {
        if (err.code === 'P0001') {
          throw new HttpError(401);
        }
        throw err;
      });
      logger.info(`Group ${req.params.group_id} updated by ${req.user!.id} and name is ${name}`);
      res.json({ name });
    }
  });
};

export default updateGroup;
