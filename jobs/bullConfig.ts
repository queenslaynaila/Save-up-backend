import {
  Job,
  Queue,
  QueueEvents,
  Worker
} from 'bullmq';
import logger from '../logger';
import { sql } from '../db';
import {
  computeAndAllocateInterest,
  finalizeInterestSummary,
  findEligiblePocketsAndScheduleInterestJobs,
  InterestCalculationData, interestDate
} from './interestProcessor';
import { redis } from './redisConfig';

export const DAILY_INTEREST_QUEUE_NAME = 'previous-day-interest-calculation';
const CRON_SCHEDULE_2AM_DAILY = '0 2 * * *';
const RETRY_DELAY_HOURS = 4;

export const JOB_FIND_POCKETS_ELIGIBLE_FOR_INTEREST = 'find-interest-eligible-pockets';
export const JOB_CALCULATE_INTEREST_FOR_POCKET = 'calculate-interest-for-pocket';
export const JOB_FINALIZE_INTEREST_SUMMARY = 'finalize-interest-summary';

export const dailyInterestQueue = new Queue(DAILY_INTEREST_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 3000
    }
  }
});

export async function scheduleDailyInterestCalculation() {
  await dailyInterestQueue.upsertJobScheduler(
    JOB_FIND_POCKETS_ELIGIBLE_FOR_INTEREST,
    {
      pattern: CRON_SCHEDULE_2AM_DAILY
    },
    {
      name: JOB_FIND_POCKETS_ELIGIBLE_FOR_INTEREST,
      data: {},
      opts: {
        removeOnComplete: true
      }
    }
  );
}

async function processJob(job: Job): Promise<void> {
  switch (job.name) {
    case JOB_FIND_POCKETS_ELIGIBLE_FOR_INTEREST:
      logger.info('[Daily Scheduler] Finding eligible pockets and creating interest jobs');
      await findEligiblePocketsAndScheduleInterestJobs();
      break;

    case JOB_CALCULATE_INTEREST_FOR_POCKET:
      await computeAndAllocateInterest(job as Job<InterestCalculationData>);
      break;

    case JOB_FINALIZE_INTEREST_SUMMARY:
      await finalizeInterestSummary();
      break;

    default:
      logger.error(`Job: ${job.name} not recognized in ${DAILY_INTEREST_QUEUE_NAME}`);
  }
}

export function startDailyInterestWorker() {
  const interestWorker = new Worker(
    DAILY_INTEREST_QUEUE_NAME,
    processJob,
    {
      connection: redis,
      concurrency: 10
    }
  );

  interestWorker.on('completed', (job) => {
    if (job.name === JOB_FINALIZE_INTEREST_SUMMARY) {
      logger.info('[Interest Processing] All interest processed and summary written to database');
    }
  });

  return interestWorker;
}

type PocketInterestFailure = {
  job_name: string,
  standard_interest_rate: number,
  locked_interest_rate: number,
  next_attempt_at: string,
  entity_id?: number,
  pocket_id?: number,
  error: string
};

const SQL_INSERT_INTEREST_JOB_FAILURES = sql<PocketInterestFailure, Record<string, never>>(`
  INSERT INTO interest_job_failures (
    job_name, entity_id, pocket_id,  standard_interest_rate, locked_interest_rate, error, next_attempt_at
  ) VALUES (
    :job_name, 
    :entity_id, 
    :pocket_id, 
    :standard_interest_rate, 
    :locked_interest_rate, 
    :error, 
    :next_attempt_at
  )
`);

async function handleJobFailure({
  jobId,
  failedReason
}: {
  jobId: string;
  failedReason: string;
}): Promise<void> {
  const job = await dailyInterestQueue.getJob(jobId);
  if (!job) return;

  const [standardInterestRate, lockedInterestRate] = await redis.mget(
    `interest-rates:${interestDate}:Standard`,
    `interest-rates:${interestDate}:Locked`
  );

  const entityId = job.data?.entity_id;
  const pocketId = job.data?.pocket_id;

  if (job.name === JOB_CALCULATE_INTEREST_FOR_POCKET && entityId && pocketId) {
    await redis.sadd(
      `interest-results:${interestDate}:failed`,
      `${entityId}-${pocketId}`
    );
  }

  await SQL_INSERT_INTEREST_JOB_FAILURES({
    job_name: job.name,
    entity_id: entityId,
    pocket_id: pocketId,
    standard_interest_rate: Number(standardInterestRate),
    locked_interest_rate: Number(lockedInterestRate),
    error: failedReason,
    next_attempt_at: new Date(Date.now() + RETRY_DELAY_HOURS * 60 * 60 * 1000).toISOString()
  }).exec();
}

const queueEvents = new QueueEvents(dailyInterestQueue.name);

queueEvents.on('failed', handleJobFailure);

export async function setupInterestJobSystem() {
  try {
    await scheduleDailyInterestCalculation();
    startDailyInterestWorker();
  } catch (error) {
    logger.error(`Failed to initialize interest job system: ${error}`);
    throw error;
  }
}
