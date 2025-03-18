import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import verifyGroupMembership, { decodeEntityOrUserId } from '../../utils';
import { entityIdParamsSchema } from '../users/schema';

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
        entity_id: entityIdParamsSchema,
        pocket_id: z.number()
      }),
      body: z.object({
        amount: z.number().min(50)
      })
    },
    auth: true,
    middlewares: [verifyGroupMembership()],
    handler: async (req, res) => {
      const entityId = decodeEntityOrUserId(req);

      await SQL_CREATE_SAVING({
        entity_id: entityId,
        pocket_id: req.params.pocket_id,
        user_id: req.user!.id,
        ...req.body
      }).exec();

      res.sendStatus(200);
    }
  });
};

export default createSaving;