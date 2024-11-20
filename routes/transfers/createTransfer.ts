import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { TransferInput, transferValidationSchema } from './types';
import { HttpError } from '../../middleware/errorMiddleware';

const SQL_CREATE_TRANSFER = sql<TransferInput, Record<string, never>>(`
  SELECT create_user_transfer(
    :source_pocket_id, 
    :destination_pocket_id, 
    :user_id, 
    :amount, 
    :entity_id
  )
`);

const createTransfer = (router: Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Create a transfer',
    schema: {
      body: transferValidationSchema
    },
    response: {
      statusCode: 201
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const entity_id = req.body.entity_id ?? req.user!.id;

      await SQL_CREATE_TRANSFER({
        ...req.body, entity_id, user_id: req.user!.id
      }).exec().catch((err) => {
        if (err.code === 'P0004') {
          throw new HttpError(400, { message: 'ERR_INSUFFICIENT_FUNDS' });
        }
      });
      res.sendStatus(201);
    }
  });
};

export default createTransfer;