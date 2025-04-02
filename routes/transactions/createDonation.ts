import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import HttpError from '../../httpError';

const simulatePaymentRequest = async (phone_number: string, amount: number) => {
  if (Math.random() > 0.5) {
    throw new HttpError(400, {message:'Payment request failed'}) 
  }
  return {
    reference_no: `TXN${Date.now()}`,
    donor_name: 'John Doe' 
  };
};

const SQL_CREATE_SAVING = sql<
  {
    entity_id: number;
    amount: number;
    pocket_id: number;
    reference_no: string;
    donor_name: string
  },
  Record<string, never>
>(`
  SELECT create_donation(
    :entity_id,
    :pocket_id,
    :reference_no,
    :donor_name,
    :amount
  )
`);

const createDonation = (router: Router) => {
  router.route({
    method: 'post',
    path: '/:entity_id/transactions/donations',
    summary: 'Deposit money to a donation pocket/fundrauser',
    schema: {
      params: z.object({
        entity_id: z.number()
      }),
      body: z.object({
        amount: z.number().min(50),
        pocket_id:z.number().int().min(1),
        phone_number:z.string().regex(/^\+\d{1,4}\d{9}$/),
      })
    },
    handler: async (req, res) => {
      const entityId = req.params.entity_id;
      const { amount, pocket_id, phone_number} = req.body;

      const paymentResponse = await simulatePaymentRequest(phone_number, amount);

      await SQL_CREATE_SAVING({
        entity_id: entityId,
        pocket_id,
        amount,
        reference_no: paymentResponse.reference_no,
        donor_name: paymentResponse.donor_name
      }).exec();

      res.sendStatus(200);
    }
  });
};

export default createDonation;