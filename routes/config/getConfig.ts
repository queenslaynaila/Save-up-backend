import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';

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
export type Config = z.infer<typeof configSchema>;

const SQL_GET_CONFIG = sql<{country_code:string}, Config>(`
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
  WHERE country_code = :country_code
`);

const getConfig = (router: Router) => {
  router.get({
    path: '/',
    summary: 'Get configurations',
    response: {
      schema: configSchema
    },
    handler: async (req, res) => {
      const host = req.headers.host ?? '';
      const countryCode = (() => {
        if (host.includes('co.ke')) return 'ke';
        if (host.includes('co.ug')) return 'ug';
        if (host.includes('co.tz')) return 'tz';
        return 'ke';
      })();

      const configurations = await SQL_GET_CONFIG({
        country_code: countryCode
      }).one();
      res.json(configurations);
    }
  });
};

export default getConfig;