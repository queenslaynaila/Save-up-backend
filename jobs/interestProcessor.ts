import z from 'zod';
import { ENUM_POCKET_TYPE } from '../routes/pockets/schema';
import { Job } from 'bullmq';
import { sql } from '../db';
import { interestCalculationQueue } from './bullConfig';
import logger from '../logger';

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

const SQL_CHECK_IF_INTEREST_ALREADY_AWARDED_TODAY = sql<
Pick<Processor, 'entity_id' | 'pocket_id'>, { already_awarded: boolean }
>(`
  SELECT EXISTS (
    SELECT 1
    FROM transactions
    JOIN transaction_types
      ON transactions.type_id = transaction_types.id
    WHERE transactions.entity_id = :entity_id
      AND transactions.pocket_id = :pocket_id
      AND transaction_types.slug = 'Interest'
      AND transactions.created_at::date = CURRENT_DATE
  ) AS already_awarded
`);

const STANDARD_SAVINGS_RATE = 0.06;
const LOCKED_SAVINGS_RATE = 0.08;

export async function awardInterest(job: Job<Processor>) {
  const { entity_id, pocket_id, pocket_type, end_of_day_balance } = job.data;

  const alreadyAwarded = await SQL_CHECK_IF_INTEREST_ALREADY_AWARDED_TODAY({
    entity_id,
    pocket_id
  }).oneFirst();

  if (alreadyAwarded) return;

  const annualInterestRate = pocket_type === 'Locked'
    ? LOCKED_SAVINGS_RATE
    : STANDARD_SAVINGS_RATE;

  const dailyInterestAmount = (end_of_day_balance * annualInterestRate) / 365;
  const roundedInterestAmount = Number(dailyInterestAmount.toFixed(2));

  if (roundedInterestAmount > 0) {
    await SQL_AWARD_INTEREST_TO_POCKET({
      entity_id,
      pocket_id,
      amount: roundedInterestAmount,
      transaction_type: 'Interest'
    }).exec();
  }
}

export async function findEligiblePocketsAndCreateJobs() {
  const eligiblePockets = await SQL_FIND_POCKETS_ELIGIBLE_FOR_INTEREST({}).many();

  logger.info(`found ${eligiblePockets.length} pockets eligible for interest`);

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
}