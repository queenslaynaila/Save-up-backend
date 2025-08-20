import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../core/router';
import { ConfigPayload, configPayloadSchema } from './createConfig';
import { Config, configSchema } from './schema';
import logger from '../../logger';

type PartialConfigPayload = Partial<ConfigPayload>;

const SQL_UPDATE_CONFIG = sql<PartialConfigPayload & { id: number }, Config>(`
  UPDATE country_configurations
    SET country_name = COALESCE(:country_name, country_name),
        country_code = COALESCE(:country_code, country_code),
        currency = COALESCE(:currency, currency),
        calling_code = COALESCE(:calling_code, calling_code),
        languages  = COALESCE(:languages, languages),
        min_deposit = COALESCE(:min_deposit, min_deposit),
        max_deposit = COALESCE(:max_deposit, max_deposit),
        min_withdrawal = COALESCE(:min_withdrawal, min_withdrawal),
        max_withdrawal  = COALESCE(:max_withdrawal, max_withdrawal),
        withdrawal_charges  = COALESCE(:withdrawal_charges, withdrawal_charges)
  WHERE id = :id
  RETURNING 
    id, 
    country_code,
    country_name,
    currency,
    calling_code,
    languages,
    min_deposit,
    max_deposit,
    min_withdrawal,
    max_withdrawal,
    withdrawal_charges,
    created_at
`);

const updateConfiguration = (router: Router) => {
  router.patch({
    path: '/:id',
    summary: 'Update a configuration',
    schema: {
      params: z.object({
        id: z.number()
      }),
      body: configPayloadSchema.partial()
    },
    response: {
      schema: configSchema
    },
    handler: async (req, res) => {
      const {
        country_code,
        country_name,
        currency,
        calling_code,
        languages,
        min_deposit,
        max_deposit,
        min_withdrawal,
        max_withdrawal,
        withdrawal_charges
      } = req.body;
    
      const configuration = await SQL_UPDATE_CONFIG({
        id: req.params.id,
        country_code,
        country_name,
        currency,
        calling_code,
        languages,
        min_deposit,
        max_deposit,
        min_withdrawal,
        max_withdrawal,
        withdrawal_charges
      }).one();
      res.json(configuration)
    }
  });
};

export default updateConfiguration;