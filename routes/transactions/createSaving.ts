import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import verifyGroupMembership from '../../utils';

const SQL_CREATE_SAVING = sql<{
  entity_id: number, 
  amount:number, 
  pocket_id:number, 
  user_id:number
}, Record<string, never>>(`
  SELECT create_saving(:entity_id, :user_id, :pocket_id, :amount)
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
      })
    },
    response: {
      201: {}
    },
    authMiddlewareOptions: {},
    middlewares: [verifyGroupMembership()],
    handler: async (req, res) => {
      const { amount, pocket_id } = req.body;
      await SQL_CREATE_SAVING({
        entity_id:Number(req.params.entity_id),
        amount,
        pocket_id,
        user_id: req.user!.id
      }).exec();
      res.sendStatus(201);
    }
  });
};

export default createSaving;