import z from 'zod';
import { ENUM_POCKET_TYPE } from '../routes/pockets/schema';
import { Job } from 'bullmq';
import { sql } from '../db';
import { dailyInterestQueue } from './bullConfig';
import logger from '../logger';

const eligiblePocketSchema = z.object({
  entity_id: z.number(),
  pocket_id: z.number(),
  pocket_type: ENUM_POCKET_TYPE,
  end_of_day_balance: z.number()
});

export type EligiblePocket = z.infer<typeof eligiblePocketSchema>;

const SQL_FIND_POCKETS_ELIGIBLE_FOR_INTEREST = sql<Record<string, never>, EligiblePocket>(`
  SELECT
    pockets.entity_id,
    pockets.xid AS pocket_id,
    pockets.pocket_type,
    latest_transaction.balance AS end_of_day_balance
  FROM pockets
  JOIN LATERAL (
    SELECT balance
    FROM transactions
    WHERE transactions.pocket_id = pockets.xid
      AND transactions.entity_id = pockets.entity_id
      AND transactions.created_at < CURRENT_DATE
    ORDER BY transactions.created_at DESC
    LIMIT 1
  ) AS latest_transaction ON true
  WHERE pockets.deleted_at IS NULL
    AND latest_transaction.balance > 0
    AND NOT EXISTS (
      SELECT 1
      FROM transactions
      JOIN transaction_types
        ON transactions.type_id = transaction_types.id
      WHERE transaction_types.slug = 'Interest'
        AND transactions.created_at::date = CURRENT_DATE
        AND transactions.entity_id = pockets.entity_id
        AND transactions.pocket_id = pockets.xid
    )
  ORDER BY pockets.entity_id, pockets.xid;
`);

const SQL_AWARD_INTEREST_TO_POCKET = sql<{
  entity_id: number,
  pocket_id: number,
  amount: number,
  transaction_type: string
}, Record<string, never>>(`
    SELECT process_transaction(:entity_id, :transaction_type, :pocket_id, :amount)
`);

const SQL_GET_CURRENT_INTEREST_RATES = sql<
Record<string, never>, {pocket_type: 'Standard' | 'Locked', rate: number}>(`
  SELECT pocket_type, rate FROM interest_rates
`);

const SQL_INCREMENT_AWARDED_POCKETS_COUNT = sql<
Record<string, never>, Record<string, never>>(`
  UPDATE interest_job_summary 
  SET awarded_pockets = awarded_pockets + 1 
  WHERE interest_date = CURRENT_DATE - INTERVAL '1 day'
`);

const SQL_INCREMENT_SKIPPED_POCKETS_COUNT = sql<
Record<string, never>, Record<string, never>>(`
  UPDATE interest_job_summary 
  SET skipped_pockets = skipped_pockets + 1 
  WHERE interest_date = CURRENT_DATE - INTERVAL '1 day'
`);

const SQL_CREATE_DAILY_INTEREST_SUMMARY = sql<{
  standard_interest_rate: number,
  locked_interest_rate: number,
  total_eligible_pockets: number
}, Record<string, never>>(`
  INSERT INTO interest_job_summary (
    interest_date, 
    standard_interest_rate, 
    locked_interest_rate, 
    total_eligible_pockets
  ) VALUES (
    CURRENT_DATE - INTERVAL '1 day',
    :standard_interest_rate,
    :locked_interest_rate,
    :total_eligible_pockets
  )
`);

export type InterestCalculationData =
Pick<EligiblePocket, 'entity_id'|'pocket_id'|'end_of_day_balance'> & {
  interest_rate: number;
};

export async function
calculateAndAwardDailyInterestForPocket(job: Job<InterestCalculationData>) {
  const { entity_id, pocket_id, interest_rate, end_of_day_balance } = job.data;

  const dailyInterestAmount = (end_of_day_balance * interest_rate) / 365;
  const roundedInterestAmount = Number(dailyInterestAmount.toFixed(2));

  if (roundedInterestAmount > 0) {
    await SQL_AWARD_INTEREST_TO_POCKET({
      entity_id,
      pocket_id,
      amount: roundedInterestAmount,
      transaction_type: 'Interest'
    }).exec();
    await SQL_INCREMENT_AWARDED_POCKETS_COUNT({}).exec();
    logger.info(`awarded in to entity ${entity_id} pocket ${pocket_id}`);
    return;
  }
  logger.info(`skiped pocket in enrirt${entity_id} pocket ${pocket_id}`);
  await SQL_INCREMENT_SKIPPED_POCKETS_COUNT({}).exec();
}
function getPreviousWorkingDay(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

export async function findEligiblePocketsAndScheduleInterestJobs() {
  const interestRates = await SQL_GET_CURRENT_INTEREST_RATES({}).many();
  const eligiblePockets = await SQL_FIND_POCKETS_ELIGIBLE_FOR_INTEREST({}).many();
  const interestDate = getPreviousWorkingDay();

  const interestRateMap = Object.fromEntries(
    interestRates.map(r => [r.pocket_type, Number(r.rate)])
  );

  await SQL_CREATE_DAILY_INTEREST_SUMMARY({
    standard_interest_rate: interestRateMap.Standard,
    locked_interest_rate: interestRateMap.Locked,
    total_eligible_pockets: eligiblePockets.length
  }).exec();

  logger.info(`found this much pockets eligible for inetrest ${eligiblePockets.length}`);

  const jobSchedulingPromises = eligiblePockets.map(pocket => dailyInterestQueue.add(
    'calculate-interest-for-pocket',
    {
      entity_id: pocket.entity_id,
      pocket_id: pocket.pocket_id,
      end_of_day_balance: pocket.end_of_day_balance,
      interest_rate: interestRateMap[pocket.pocket_type]
    },
    {
      jobId: `interest-${interestDate}-${pocket.entity_id}-${pocket.pocket_id}`,
      removeOnComplete: true
    }
  ));

  await Promise.all(jobSchedulingPromises);
}