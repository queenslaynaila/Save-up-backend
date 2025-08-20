import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../core/router';
import { Config, configSchema } from './schema';

const SQL_GET_CONFIG = sql<Record<string,never>, Config>(`
  SELECT 
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
  FROM country_configurations
  WHERE deleted_at IS NULL
`);

const getConfiguration = (router: Router) => {
  router.get({
    path: '/',
    summary: 'Get configurations',
    response: {
      schema: z.array(configSchema)
    },
    handler: async (req, res) => {
      const configurations = await SQL_GET_CONFIG({}).many();
      res.json(configurations);
    }
  });
};

export default getConfiguration;