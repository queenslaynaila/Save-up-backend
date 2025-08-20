import { z } from 'zod';
import { sql } from '../../db';
import { UserRole } from '../users/schema';
import Router from '../../core/router';
import { Rate, rateSchema } from './createInterestRates';

const SQL_GET_RATE = sql<Record<string,never>, Rate & {id:number}>(`
  SELECT id, pocket_type, rate
  FROM interest_rates
`);

const getInterestRates = (router: Router) => {
  router.get({
    path: '/',
    auth: true,
    summary: 'Get interest rates',
    response: {
      statusCode: 201,
      schema: z.array(rateSchema.extend({
        id: z.number().int().min(1)
      }))
    }, 
    handler: async (req, res) => {
      const rates = await SQL_GET_RATE({}).many();
      res.json(rates);
    }
  });
};

export default getInterestRates;