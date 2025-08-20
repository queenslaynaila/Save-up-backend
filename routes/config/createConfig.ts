import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../core/router';
import { Config, configSchema } from './schema';

export const configPayloadSchema = configSchema.pick({
  country_code: true,
  country_name: true,
  currency: true,
  calling_code:true,
  languages:true,
  min_deposit:true,
  max_deposit:true,
  min_withdrawal:true,
  max_withdrawal:true,
  withdrawal_charges:true
});

export type ConfigPayload = z.infer<typeof configPayloadSchema>;

const SQL_CREATE_CONFIG = sql<ConfigPayload, Config>(`
  INSERT INTO country_configurations(
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
  )
  VALUES (
    :country_code,
    :country_name,
    :currency,
    :calling_code,
    :languages,
    :min_deposit,
    :max_deposit,
    :min_withdrawal,
    :max_withdrawal,
    :withdrawal_charges
  )
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

const createConfiguration = (router: Router) => {
  router.post({
    path: '/',
    summary: 'Make a configuration',
    schema: {
      body: configPayloadSchema
    },
    response: {
      schema: configSchema
    },
    handler: async (req, res) => {
      const configuration = await SQL_CREATE_CONFIG({
        ...req.body
      }).one();
      res.json(configuration);
    }
  });
};

export default createConfiguration;