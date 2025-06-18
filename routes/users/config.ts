import z from 'zod';
import Router from '../../router';
export const DepositBonusConfigSchema = z.object({
  maximum_bonus: z.object({
    scope: z.literal('country').describe('This value varies by country.'),
    type: z.literal('money').describe('Represents a monetary value.'),
    value: z.record(z.string(), z.number()).describe('Max bonus amount per country (e.g., { KE: 1000 }).')
  }).describe('Maximum bonus a user can receive per country.'),

  wager_multiplier: z.object({
    scope: z.literal('global').describe('Applies globally.'),
    type: z.literal('number').describe('Numeric multiplier type.'),
    value: z.number().describe('Multiplier applied to the bonus before withdrawal.')
  }).describe('Wagering requirement multiplier.'),

  days_to_wager: z.object({
    scope: z.literal('global'),
    type: z.literal('number'),
    value: z.number().describe('Number of days allowed to meet wagering requirements.')
  }).describe('Time window (in days) to meet wagering conditions.'),

  minimum_deposit: z.object({
    scope: z.literal('country'),
    type: z.literal('money'),
    value: z.record(z.string(), z.number()).describe('Minimum required deposit per country.')
  }).describe('Minimum deposit amount to qualify for the bonus.'),

  percentage_bonus: z.object({
    scope: z.literal('global'),
    type: z.literal('percentage').describe('Percentage format (e.g. 50 = 50%).'),
    value: z.number().describe('Bonus percentage applied to the deposit.')
  }).describe('Bonus percentage applied to qualifying deposits.')
});

export const NewUserXDaysConfigSchema = z.object({
  games: z.object({
    scope: z.literal('global'),
    type: z.literal('array'),
    value: z.array(z.string())
  }),
  first_x_days: z.object({
    scope: z.literal('global'),
    type: z.literal('number'),
    value: z.number()
  }),
  minimum_multiplier: z.object({
    scope: z.literal('global'),
    type: z.literal('number'),
    value: z.number()
  }),
  number_of_qualifying_bets: z.object({
    scope: z.literal('global'),
    type: z.literal('number'),
    value: z.number()
  }),
  minimum_stake: z.object({
    scope: z.literal('country'),
    type: z.literal('money'),
    value: z.record(z.string(), z.number())
  }),
  daily_win: z.object({
    scope: z.literal('country'),
    type: z.literal('money'),
    value: z.record(z.string(), z.number())
  })
});

const OfferSchema = z.object({
  type: z.union([
    z.literal('Deposit_Bonus'),
    z.literal('New_User_X_Days')
  ]),
  default_config: z.union([
    DepositBonusConfigSchema,
    NewUserXDaysConfigSchema
  ])
});

const OffersListSchema = z.array(OfferSchema);

export default (router: Router) => {
  router.get({
    path: '/config',
    summary: 'Get offer configuration',
    description: 'Returns mock data representing offer configuration for testing purposes.',
    auth: true,
    schema: {
      body: z.object({
        sample: z.string().optional().describe('Optional sample parameter for testing.')
      })
    },
    response: {
      statusCode: 200,
      schema: OffersListSchema
    },
    handler: async (req, res) => {
      const config: z.infer<typeof OffersListSchema> = [
        {
          type: 'Deposit_Bonus',
          default_config: {
            maximum_bonus: {
              scope: 'country',
              type: 'money',
              value: {
                KE: 1000,
                UG: 800
              }
            },
            wager_multiplier: {
              scope: 'global',
              type: 'number',
              value: 10
            },
            days_to_wager: {
              scope: 'global',
              type: 'number',
              value: 14
            },
            minimum_deposit: {
              scope: 'country',
              type: 'money',
              value: {
                KE: 100,
                UG: 50
              }
            },
            percentage_bonus: {
              scope: 'global',
              type: 'percentage',
              value: 50
            }
          }
        },
        {
          type: 'New_User_X_Days',
          default_config: {
            games: {
              scope: 'global',
              type: 'array',
              value: ['GAME1', 'GAME2']
            },
            first_x_days: {
              scope: 'global',
              type: 'number',
              value: 7
            },
            minimum_multiplier: {
              scope: 'global',
              type: 'number',
              value: 1.5
            },
            number_of_qualifying_bets: {
              scope: 'global',
              type: 'number',
              value: 5
            },
            minimum_stake: {
              scope: 'country',
              type: 'money',
              value: {
                KE: 50,
                UG: 30
              }
            },
            daily_win: {
              scope: 'country',
              type: 'money',
              value: {
                KE: 200,
                UG: 150
              }
            }
          }
        }
      ];

      res.json(config);
    }
  });
};
