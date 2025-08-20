import { z } from 'zod';
import { sql } from '../../db';
import { UserRole } from '../users/schema';
import Router from '../../core/router';
import { Rate, rateSchema } from './createInterestRates';
import logger from '../../logger';

const SQL_UPDATE_RATE = sql<{id:number, rate:number}, Rate & {id:number}>(`
  UPDATE  interest_rates
    SET rate = :rate
    WHERE id = :id
    RETURNING id, pocket_type, rate
`);

const updateInterestRates = (router: Router) => {
  router.patch({
    path: '/:id',
    auth: [UserRole.enum.Admin],
    summary: 'Update interest rates',
    schema:{
      params: z.object({
        id: z.number().int().min(1)
      }),
      body: z.object({
        rate: z.number()
      })
    },
    response: {
      statusCode: 201,
      schema: rateSchema.extend({
        id: z.number().int().min(1)
      })
    },
    handler: async (req, res) => {
      const rate = await SQL_UPDATE_RATE({
        id: req.params.id,
        rate: req.body.rate
      }).one().catch();
      res.json(rate);
    }
  });
};

export default updateInterestRates;