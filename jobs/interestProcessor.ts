import z from 'zod';
import { ENUM_POCKET_TYPE } from '../routes/pockets/schema';
import { Job } from 'bullmq';
import { sql } from '../db';
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

const SQL_GET_ALL_INTEREST_RATES = sql<Record<string, never>, {pocket_type: 'Standard' | 'Locked', rate: number}>(`
  SELECT pocket_type, rate FROM interest_rates
`);

export async function awardInterest(job: Job<Processor & {rate:number}>) {
  const { entity_id, pocket_id, rate, end_of_day_balance } = job.data;

  const dailyInterestAmount = (end_of_day_balance * rate) / 365;
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
  const interestRates = await SQL_GET_ALL_INTEREST_RATES({}).many();
  const eligiblePockets = await SQL_FIND_POCKETS_ELIGIBLE_FOR_INTEREST({}).many();

  const rateMap = Object.fromEntries(
    interestRates.map(r => [r.pocket_type, Number(r.rate)])
  );

  const jobCreationPromises = eligiblePockets.map(pocket => interestCalculationQueue.add(
    'calculate-pocket-interest',
    {
      entity_id: pocket.entity_id,
      pocket_id: pocket.pocket_id,
      end_of_day_balance: pocket.end_of_day_balance,
      interest_rate: rateMap[pocket.pocket_type]
    }
  ));

  await Promise.all(jobCreationPromises);
}