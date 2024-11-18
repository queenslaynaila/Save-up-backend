import Router from '../../router';
import { sql } from '../../db';
import { ExternalSavingInterface, externalSavingSchema } from './types';
import authMiddleware from '../../middleware/authorization';

const SQL_CREATE_SAVING = sql<ExternalSavingInterface, Record<string, never>>(`
  SELECT create_external_savings( 
    :entity_id,
    :pocket_id, 
    :donor_id, 
    :amount, 
    :show_details
  )
`);

const createExSaving = (router: Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Create external saving',
    schema: {
      body: externalSavingSchema
    },
    response: {
      statusCode: 201
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      await SQL_CREATE_SAVING({ ...req.body }).exec();
      res.sendStatus(201);
    }
  });
};

export default createExSaving;