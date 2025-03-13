import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import verifyGroupMembership from '../../utils';

const SQL_CREATE_SAVING = sql<
  {
    entity_id: number,
    amount: number,
    pocket_id: number,
    user_id: number
  },
  Record<string, never>
>(`
  SELECT create_saving(:entity_id, :user_id, :pocket_id, :amount)
`);

const createSaving = (router: Router) => {
  router.route({
    method: 'post',
    path: '/:entity_id/:pocket_id/deposit',
    summary: 'Deposit money to a pocket',
    request: {
      params: z.object({
        entity_id: z.union([
          z.string().regex(/^[1-9]\d*$/),
          z.literal("me")
        ]).default('me'),
        pocket_id: z.string().regex(/^[1-9]\d*$/)
      }),
      body: z.object({
        amount: z.number().min(50)
      })
    },
    authMiddlewareOptions: {},
    middlewares: [
      verifyGroupMembership()
    ],
    handler: async (req, res) => {
      const entityId = Number(req.params.entity_id);
      const pocketId = Number(req.params.pocket_id);

      await SQL_CREATE_SAVING({
        entity_id: entityId,
        amount:req.body.amount,
        pocket_id: pocketId,
        user_id: req.user!.id
      }).exec();

      res.sendStatus(200);
    }
  });
};

export default createSaving;