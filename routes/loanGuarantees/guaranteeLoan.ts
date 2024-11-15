import Router from '../../router';
import { sql } from '../../db';
import { BaseGuarantee, guaranteeLoanBodySchema } from './types';
import authMiddleware from '../../middleware/authorization';

const SQL_GUARANTEE_LOAN = sql<BaseGuarantee, Record<string, never>>(`
  INSERT INTO  guarantor_approvals (group_id, request_id, guarantor_id, approval) 
  VALUES (:group_id, :request_id, :user_id, :approval);
`);

const guaranteeLoan = (router: Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Guarantee a loan',
    schema: {
      body: guaranteeLoanBodySchema
    },
    response: {
      statusCode: 201
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      await SQL_GUARANTEE_LOAN({
        ...req.body,
        user_id: req.user!.id
      }).exec();
      res.sendStatus(201);
    }
  });
};

export default guaranteeLoan;