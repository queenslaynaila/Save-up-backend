import { z } from 'zod';
import Router from '../../router';
import { sql } from '../../db';
import { decodeEntityAndVerifyAccess, verifyPin } from '../../utils';

const SQL_CREATE_LOAN_GUARANTORS = sql<{
  group_id: number;
  initiator_id: number;
  guarantor_ids: number[];
}, Record<string, never>>(`
  SELECT create_loan_request(
    :group_id,
    :initiator_id,
    :guarantor_ids
  )
`);

const addLoanGuarantors = (router: Router) => {
  router.route({
    method: 'post',
    path: '/:group_id/loans/:loan_id/guarantors',
    summary: 'Add guarantors for a loan',
    auth: true,
    schema: {
      params: z.object({
        group_id: z.number(),
        loan_id: z.number()
      }),
      body: z.object({
        guarantor_ids: z.array(z.number()),
        pin: z.number()
      })
    },
    middlewares: [verifyPin],
    handler: async (req, res) => {
      const groupId = await decodeEntityAndVerifyAccess(req);

      await SQL_CREATE_LOAN_GUARANTORS({
        group_id: groupId,
        initiator_id: req.user!.id,
        guarantor_ids: req.body.guarantor_ids
      }).exec();
      
      res.sendStatus(201);
    }
  });
};

export default addLoanGuarantors;
