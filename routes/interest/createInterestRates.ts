import { z } from 'zod';
import { sql } from '../../db';
import { UserRole } from '../users/schema';
import Router from '../../core/router';
import { ENUM_POCKET_TYPE } from '../pockets/schema';
import HttpError from '../../httpError';

export const rateSchema = z.object({
  pocket_type:  ENUM_POCKET_TYPE,
  rate: z.number().min(0).max(99.99)
})

export type Rate = z.infer<typeof rateSchema>;

const SQL_CREATE_RATE = sql<Rate,Rate & {id:number}>(`
   INSERT INTO interest_rates (pocket_type, rate)
   VALUES (:pocket_type, :rate)
   RETURNING id, pocket_type, rate
`);

const createInterestRates = (router: Router) => {
  router.post({
    path: '/',
    auth: UserRole.enum.Admin,
    summary: 'Create interest rate',
    schema: {
      body: rateSchema
    },
    response: {
      statusCode: 201,
      schema: rateSchema.extend({
        id: z.number().int().min(1)
      })
    },
    handler: async (req, res) => {
      const rates = await SQL_CREATE_RATE({
        ...req.body
      }).one().catch((e)=> {
        if (e.code === '23505') {
          throw new HttpError(409)
        }
        throw e;
      });
      res.json(rates);
    }
  });
};

export default createInterestRates;