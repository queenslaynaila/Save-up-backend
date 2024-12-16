import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import logger from '../../logger';

const SQL_CREATE_SAVING = sql<{user_id: number, amount:number, pocket_id:number, group_id:number | null}, Record<string, never>>(`
  SELECT create_saving(:user_id, :amount, :pocket_id, :group_id)
`);

const createSaving = (router: Router) => {
  router.route({
    method: 'post',
    path: '/save',
    summary: 'Create a saving',
    description: 'Endpoint allows to deposit money to a pocket belonging to either grp or user. \n\n'
    + '-**Group Deposit**: For grp deposits add the optional grp id in body.\n\n'
    + 'If no group id in body is provided app will assume its a individual pocket transaction',
    request: {
      body: z.object({
        amount: z.number().min(50),
        pocket_id: z.number().min(1),
        group_id: z.number().optional()
      })
    },
    response: {
      201: {}
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const { amount, pocket_id, group_id } = req.body;
      logger.info('we are here');
      await SQL_CREATE_SAVING({
        user_id: req.user!.id,
        amount,
        pocket_id,
        group_id: group_id ?? null
      }).exec();
      logger.info('we are here again');
      res.sendStatus(201);
    }
  });
};

export default createSaving;