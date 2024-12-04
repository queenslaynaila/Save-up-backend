import Router from '../../router';
import { sql } from '../../db';

import { SavingCreateType, savingPostRequestSchema } from './types';

const SQL_CREATE_SAVING = sql<SavingCreateType, Record<string, never>>(`
  SELECT create_user_saving(:user_id, :pocket_id, :amount)
`);

const createSaving = (router: Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Create a saving',
    schema: {
      body: savingPostRequestSchema
    },
    response: {
      statusCode: 201
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      await SQL_CREATE_SAVING({
        ...req.body,
        user_id: req.user!.id
      }).exec();
      res.sendStatus(201);
    }
  });
};

export default createSaving;