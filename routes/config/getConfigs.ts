import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../core/router';

const configSchema = z.object({
  country_name: z.string(),
  calling_code: z.number(),
  languages: z.array(z.string()),
  max_deposit: z.number(),
  min_deposit: z.number(),
  max_withdrawal: z.number(),
  min_withdrawal: z.number(),
  withdrawal_charges: z.string(),
  currency: z.string()
});
type Config = z.infer<typeof configSchema>;

const SQL_GET_CONFIG = sql<Record<string,never>, Config>(`
  SELECT 
    country_name, 
    currency, 
    calling_code, 
    languages,
    min_deposit,
    max_deposit,
    min_withdrawal,
    max_withdrawal,
    withdrawal_charges
  FROM country_configurations
`);

const getConfigs = (router: Router) => {
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

export default getConfigs;