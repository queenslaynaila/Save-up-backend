import z from 'zod';
import { ENUM_POCKET_TYPE } from '../routes/pockets/schema';
import { Job } from 'bullmq';
import { sql } from '../db';
import logger from '../logger';
import { interestCalculationQueue } from './bullConfig';

const pocketDataSchema = z.object({
  entity_id: z.number(),
  pocket_id: z.number(),
  pocket_type: ENUM_POCKET_TYPE,
  end_of_day_balance: z.number()
});

export type Processor = z.infer<typeof pocketDataSchema>;

const SQL_FIND_POCKETS_ELIGIBLE_FOR_INTEREST = sql<Record<string, never>, Processor>(`
   SELECT
    pockets.entity_id,
    pockets.pocket_id,
    pockets.pocket_type,
    transaction_yesterday.balance AS end_of_day_balance
  FROM pockets
  JOIN LATERAL (
    SELECT balance
    FROM transactions
    WHERE transactions.pocket_id = pockets.pocket_id
      AND transactions.entity_id = pockets.entity_id
      AND transactions.created_at::date = CURRENT_DATE - 1
    ORDER BY transactions.created_at DESC
    LIMIT 1
  ) AS transaction_yesterday ON true
  WHERE pockets.deleted_at IS NULL
    AND transaction_yesterday.balance > 0  
`);

const SQL_AWARD_INTEREST_TO_POCKET = sql<{
  entity_id: number,
  pocket_id: number,
  amount: number,
  transaction_type: string
}, Record<string, never>>(`
    SELECT process_transaction(:entity_id, :transaction_type, :pocket_id, :amount)
`);

const SQL_CHECK_IF_INTEREST_ALREADY_AWARDED_TODAY = sql<
Pick<Processor, 'entity_id' | 'pocket_id'>, { already_awarded: boolean }>(`
  SELECT EXISTS (
    SELECT 1
    FROM transactions transactions
    JOIN transaction_types transaction_types
      ON transactions.type_id = transaction_types.id
    WHERE transactions.entity_id = :entity_id
      AND transactions.pocket_id = :pocket_id
      AND transactions.slug = 'Interest'
      AND transactions.created_at::date = CURRENT_DATE
  ) AS already_awarded
`);

const pocketErrorSchema = z.object({
  entity_id: z.number(),
  pocket_id: z.number(),
  error: z.string()
});

type PocketError = z.infer<typeof pocketErrorSchema>;

const SQL_LOG_POCKET_INTEREST_ERROR = sql<PocketError, Record<string, never>>(`
    INSERT INTO interest_job_errors (entity_id, pocket_id, error)
    VALUES (:entity_id, :pocket_id, :error)
`);

const STANDARD_SAVINGS_RATE = 0.06;
const LOCKED_SAVINGS_RATE = 0.08;

export async function awardInterest(job: Job<Processor>) {
  const { entity_id, pocket_id, pocket_type, end_of_day_balance } = job.data;

  const alreadyAwarded = await SQL_CHECK_IF_INTEREST_ALREADY_AWARDED_TODAY({
    entity_id,
    pocket_id
  }).oneFirst();

  if (alreadyAwarded) {
    logger.info(`Interest already awarded today for pocket ${pocket_id}`);
    return;
  }

  const annualInterestRate = pocket_type === 'Locked' ? LOCKED_SAVINGS_RATE : STANDARD_SAVINGS_RATE;
  const dailyInterestAmount = (end_of_day_balance * annualInterestRate) / 365;
  const roundedInterestAmount = Number(dailyInterestAmount.toFixed(2));

  if (roundedInterestAmount > 0) {
    await SQL_AWARD_INTEREST_TO_POCKET({
      entity_id: entity_id,
      pocket_id: pocket_id,
      amount: roundedInterestAmount,
      transaction_type: 'Interest'
    }).exec().catch(async error => {
      logger.error(`Failed to award interest for pocket ${pocket_id}:`, error);
      await SQL_LOG_POCKET_INTEREST_ERROR({
        entity_id: entity_id,
        pocket_id: pocket_id,
        error: error.message
      }).exec();
    });
  }
}

export async function findEligiblePocketsAndCreateJobs() {
  const eligiblePockets = await SQL_FIND_POCKETS_ELIGIBLE_FOR_INTEREST({}).many();

  const jobCreationPromises = eligiblePockets.map(pocket => interestCalculationQueue.add(
    'calculate-pocket-interest',
    {
      entity_id: pocket.entity_id,
      pocket_id: pocket.pocket_id,
      pocket_type: pocket.pocket_type,
      end_of_day_balance: pocket.end_of_day_balance
    }
  ));

  await Promise.all(jobCreationPromises);

  logger.info(`Created ${eligiblePockets.length} interest calculation jobs`);
}