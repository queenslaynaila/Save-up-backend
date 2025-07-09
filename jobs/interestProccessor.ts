import z from 'zod';
import { ENUM_POCKET_TYPE } from '../routes/pockets/schema';
import { Job } from 'bullmq';
import { sql } from '../db';
import logger from '../logger';
import { interestQueue } from './bullConfig';

const proccesorSchema = z.object({
  entity_id: z.number(),
  pocket_id: z.number(),
  pocket_type: ENUM_POCKET_TYPE,
  end_of_day_balance: z.number()
});

export type Proccessor = z.infer<typeof proccesorSchema>;

const SQL_GET_ELIGIBLE_POCKETS = sql<Record<string, never>, Proccessor>(`
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

const SQL_AWARD_INTEREST = sql<{
  entity_id:number,
  pocket_id:number,
  amount:number,
  transaction_type:string
}, Record<string, never>>(`
    SELECT process_transaction(:entity_id, :transaction_type, :pocket_id, :amount)
`);

const SQL_HAS_ALREADY_RECEIVED_INTEREST = sql<
Pick<Proccessor, 'entity_id'|'pocket_id'>, {already_awarded:boolean}>(`
  SELECT EXIST (
    SELECT 1
    from transactions transactions
    JOIN transaction_types transaction_types
      ON transactions.type_id = transaction_types.id
    WHERE transactions.entity_id = :entity_id
      AND transactions.pocket_id = :pocket_id
      AND transactions.slug = 'Interest'
      AND transactions.created_at::date = CURRENT_DATE
  ) AS already_awarded
`);

const errorSchema = z.object({
  entity_id: z.number(),
  pocket_id: z.number(),
  error: z.string()
});

type PocketError = z.infer<typeof errorSchema>;

const SQL_UPDATE_POCKET_ERROR = sql<PocketError, Record<string, never>>(`
    INSERT INTO pocket_errors (entity_id, pocket_id, error)
    VALUES (:entity_id, :pocket_id, :error)
`);

const STANDARD_RATE = 0.06;
const LOCKED_RATE = 0.08;

export async function awardInterest(job: Job<Proccessor>) {
  const { entity_id, pocket_id, pocket_type, end_of_day_balance } = job.data;

  const alreadyAwarded = await SQL_HAS_ALREADY_RECEIVED_INTEREST({
    entity_id,
    pocket_id
  }).oneFirst();

  if (alreadyAwarded) return;

  const rate = pocket_type === 'Locked' ? LOCKED_RATE : STANDARD_RATE;
  const rawInterest = (end_of_day_balance * rate) / 365;
  const interest = Number(rawInterest.toFixed(2));

  if (interest > 0) {
    await SQL_AWARD_INTEREST({
      entity_id: entity_id,
      pocket_id: pocket_id,
      amount: interest,
      transaction_type: 'Interest'
    }).exec().catch(async e =>{
      await SQL_UPDATE_POCKET_ERROR({
        entity_id: entity_id,
        pocket_id: pocket_id,
        error: e.message
      }).exec();
    });
  }
}

export async function enqueueInterestJobs() {
  const pockets = await SQL_GET_ELIGIBLE_POCKETS({}).many();

  const enqueuePromises = pockets.map(pocket => interestQueue.add(
    'award-interest',
    {
      entity_id: pocket.entity_id,
      pocket_id: pocket.pocket_id,
      pocket_type: pocket.pocket_type,
      end_of_day_balance: pocket.end_of_day_balance
    }
  ));

  await Promise.all(enqueuePromises);

  logger.info(`Enqueued ${pockets.length} interest jobs.`);
}