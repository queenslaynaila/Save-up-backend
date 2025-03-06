import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';

const SQL_CREATE_SAVING = sql<{user_id: number, amount:number, pocket_id:number, group_id:number | null}, Record<string, never>>(`
  SELECT create_saving(:user_id, :amount, :pocket_id, :group_id)
`);

const createSaving = (router: Router) => {
  router.route({
    method: 'post',
    path: '/:entity_id/save',
    summary: 'Create a saving',
    request: {
      params: z.object({
        entity_id: z.union([
          z.string().regex(/^[1-9]\d*$/, "Must be a positive integer string"),
          z.literal("me"), 
        ]).default('me' )
      }),
      body: z.object({
        amount: z.number().min(50),
        pocket_id: z.number().min(1)
      }),
      query: z.object({
        group_id: z.string().regex(/^\d+$/).optional()
      })
    },
    response: {
      201: {}
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const { amount, pocket_id } = req.body;
      await SQL_CREATE_SAVING({
        user_id: req.user!.id,
        amount,
        pocket_id,
        group_id: Number(req.query.group_id) || null
      }).exec();
      res.sendStatus(201);
    }
  });
};

export default createSaving;