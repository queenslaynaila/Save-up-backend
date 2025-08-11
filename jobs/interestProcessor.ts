import { FlowProducer, Job } from 'bullmq';
import { sql } from '../db';
import { PocketType } from '../routes/pockets/schema';
import { redis } from './redisConfig';
import {
  DAILY_INTEREST_QUEUE_NAME,
  JOB_CALCULATE_INTEREST_FOR_POCKET,
  JOB_FINALIZE_INTEREST_SUMMARY,
  JOB_FIND_POCKETS_ELIGIBLE_FOR_INTEREST,
  RETRY_DELAY_HOURS,
  SQL_INSERT_INTEREST_JOB_FAILURES
} from './bullConfig';

const DAYS_PER_YEAR = 365;
const MIN_INTEREST_AMOUNT = 0.01;

type EligiblePocket = {
  entity_id: number,
  pocket_id: number,
  pocket_type: PocketType,
  end_of_day_balance: number
};

export type InterestCalculationData = Pick<
EligiblePocket, 'entity_id' | 'pocket_id' | 'end_of_day_balance'> & {
  interest_rate: number;
};

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

const SQL_CREATE_DAILY_INTEREST_SUMMARY = sql<{
  standard_interest_rate: number,
  locked_interest_rate: number,
  eligible: number,
  awarded:number,
  skipped:number,
  failed:number,
}, Record<string, never>>(`
  INSERT INTO interest_job_summary (
    interest_date, 
    standard_interest_rate, 
    locked_interest_rate, 
    eligible_pockets,
    awarded_pockets,
    skipped_pockets,
    failed_pockets
  ) VALUES (
    CURRENT_DATE - INTERVAL '1 day',
    :standard_interest_rate,
    :locked_interest_rate,
    :eligible,
    :awarded,
    :skipped,
    :failed
  )
`);

function getPreviousWorkingDay(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

export const interestDate = getPreviousWorkingDay();

const flowProducer = new FlowProducer({ connection: redis });

async function clearPreviousInterestData() {
  await redis.del(
    `interest-results:${interestDate}:awarded`,
    `interest-results:${interestDate}:skipped`,
    `interest-results:${interestDate}:failed`,
    `interest-rates:${interestDate}:Standard`,
    `interest-rates:${interestDate}:Locked`,
    `interest-counts:${interestDate}:eligible`
  );
}

async function storeInterestMetadata(
  interestRateMap: Record<string, number>,
  totalEligiblePockets: number
): Promise<void> {
  await redis.mset({
    [`interest-rates:${interestDate}:Standard`]: interestRateMap.Standard,
    [`interest-rates:${interestDate}:Locked`]: interestRateMap.Locked
  });
  await redis.set(`interest-counts:${interestDate}:eligible`, totalEligiblePockets);
}

export async function findEligiblePocketsAndScheduleInterestJobs() {
  await clearPreviousInterestData();

  const [interestRates, eligiblePockets] = await Promise.all([
    SQL_GET_CURRENT_INTEREST_RATES({}).many(),
    SQL_FIND_POCKETS_ELIGIBLE_FOR_INTEREST({}).many()
  ]);

  const interestRateMap = Object.fromEntries(
    interestRates.map(r => [r.pocket_type, Number(r.rate)])
  );

  const standardRate = interestRateMap['Standard'];
  const lockedRate = interestRateMap['Locked'];

  if (
    typeof standardRate !== 'number' || isNaN(standardRate) ||
    typeof lockedRate !== 'number' || isNaN(lockedRate)
  ) {
    await SQL_INSERT_INTEREST_JOB_FAILURES({
      job_name: JOB_FIND_POCKETS_ELIGIBLE_FOR_INTEREST,
      standard_interest_rate: standardRate,
      entity_id: undefined,
      pocket_id: undefined,
      locked_interest_rate: lockedRate,
      error: `Missing or invalid interest rate(s).No records processed`,
      next_attempt_at: new Date(Date.now() + RETRY_DELAY_HOURS * 60 * 60 * 1000).toISOString()
    }).exec();
    return;
  }

  await storeInterestMetadata(interestRateMap, eligiblePockets.length);

  const calculationJobs = eligiblePockets.map(pocket => ({
    name: JOB_CALCULATE_INTEREST_FOR_POCKET,
    data: {
      entity_id: pocket.entity_id,
      pocket_id: pocket.pocket_id,
      end_of_day_balance: pocket.end_of_day_balance,
      interest_rate: interestRateMap[pocket.pocket_type]
    },
    queueName: DAILY_INTEREST_QUEUE_NAME,
    opts: {
      jobId: `interest-${interestDate}-${pocket.entity_id}-${pocket.pocket_id}`,
      removeOnComplete: true
    }
  }));

  await flowProducer.add({
    name: JOB_FINALIZE_INTEREST_SUMMARY,
    data: {},
    queueName: DAILY_INTEREST_QUEUE_NAME,
    opts: {
      jobId: `${JOB_FINALIZE_INTEREST_SUMMARY}-${interestDate}`,
      removeOnComplete: true
    },
    children: calculationJobs
  });
}

export async function computeAndAllocateInterest(job: Job<InterestCalculationData>) {
  const { entity_id, pocket_id, interest_rate, end_of_day_balance } = job.data;

  const dailyInterestAmount = (end_of_day_balance * interest_rate) / DAYS_PER_YEAR;
  const roundedInterestAmount = Number(dailyInterestAmount.toFixed(2));

  if (roundedInterestAmount > MIN_INTEREST_AMOUNT) {
    await SQL_AWARD_INTEREST_TO_POCKET({
      entity_id,
      pocket_id,
      amount: roundedInterestAmount,
      transaction_type: 'Interest'
    }).exec();
    await redis.sadd(`interest-results:${interestDate}:awarded`, `${entity_id}-${pocket_id}`);
  } else {
    await redis.sadd(`interest-results:${interestDate}:skipped`, `${entity_id}-${pocket_id}`);
  }
}

export async function finalizeInterestSummary() {
  const awarded = await redis.scard(`interest-results:${interestDate}:awarded`);
  const skipped = await redis.scard(`interest-results:${interestDate}:skipped`);
  const failed = await redis.scard(`interest-results:${interestDate}:failed`);
  const eligible = Number(await redis.get(`interest-counts:${interestDate}:eligible`));

  const [standard_interest_rate, locked_interest_rate] = await redis.mget(
    `interest-rates:${interestDate}:Standard`,
    `interest-rates:${interestDate}:Locked`
  );

  await SQL_CREATE_DAILY_INTEREST_SUMMARY({
    awarded: awarded,
    skipped: skipped,
    failed: failed,
    eligible: eligible,
    standard_interest_rate: Number(standard_interest_rate!),
    locked_interest_rate: Number(locked_interest_rate!)
  }).exec();
}