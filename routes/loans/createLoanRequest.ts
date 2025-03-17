import { z } from 'zod';
import Router from '../../router';
import { sql } from '../../db';

const loanSchema = z.object({
  reason: z.string(),
  repayment_period: z.string(),
  guarantors: z.array(z.number()),
  amount: z.number()
});

type LoanRequest = z.infer<typeof loanSchema> & {
  group_id: number;
  pocket_id: number;
  initiator_id: number;
};

const SQL_CREATE_LOAN_REQUEST = sql<LoanRequest, Record<string, never>>(`
  SELECT create_loan_request(
    :group_id,
    :initiator_id,
    :pocket_id,
    :amount,
    :reason,
    :repayment_period,
    :guarantors
  )
`);

const requestLoan = (router: Router) => {
  router.route({
    method: 'post',
    path: '/:group_id/:pocket_id/',
    summary: 'Request a loan',
    request: {
      params: z.object({
        group_id: z.string().regex(/^[1-9]\d*$/),
        pocket_id: z.string().regex(/^[1-9]\d*$/)
      }),
      body: loanSchema
    },
    handler: async (req, res) => {
      await SQL_CREATE_LOAN_REQUEST({
        group_id: parseInt(req.params.group_id),
        pocket_id: parseInt(req.params.pocket_id),
        initiator_id: req.user!.id,
        ...req.body
      }).exec();
      res.sendStatus(201);
    }
  });
};

export default requestLoan;