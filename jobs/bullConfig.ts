import { Job, Queue, QueueEvents, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import Config from '../config';
import logger from '../logger';
import {
  calculateAndAwardDailyInterestForPocket,
  findEligiblePocketsAndScheduleInterestJobs,
  InterestCalculationData
} from './interestProcessor';
import z from 'zod';
import { sql } from '../db';

const redis = new Redis({
  host: Config.REDIS_HOST,
  port: Config.REDIS_PORT,
  password: Config.REDIS_PASSWORD,
  maxRetriesPerRequest: null
});

export const dailyInterestQueue = new Queue('daily-interest-calculation', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 3000 }
  }
});

export async function scheduleDailyInterestCalculation() {
  const schedulers = await dailyInterestQueue.getJobSchedulers();

  const alreadyScheduled = schedulers.some(scheduler => scheduler.name === 'create-daily-interest-jobs'
    && scheduler.pattern === '0 2 * * *');

  if (!alreadyScheduled) {
    await dailyInterestQueue.add(
      'create-daily-interest-jobs',
      {},
      {
        jobId: 'daily-interest-scheduler',
        repeat: {
          pattern: '0 2 * * *'
        },

        removeOnComplete: true
      }
    );
    logger.info('Scheduled daily interest job creaetion');
  }
}

export function startDailyInterestWorker() {
  new Worker(
    'daily-interest-calculation',
    async (job: Job) => {
      switch (job.name) {
        case 'create-daily-interest-jobs':
          logger.info('[Daily Scheduler] Finding eligible pockets and creating interest jobs');
          await findEligiblePocketsAndScheduleInterestJobs();
          break;

        case 'calculate-interest-for-pocket':
          logger.info(`Processing interest job for entity: ${job.data.entity_id}, pocket: ${job.data.pocket_id}`);
          await calculateAndAwardDailyInterestForPocket(job as Job<InterestCalculationData>);
          break;

        default:
          logger.warn(`Unknown job type: ${job.name}`);
      }
    },
    {
      connection: redis,
      concurrency: 10
    }
  )
    .on('completed', (job) => {
      if (job.name === 'calculate-interest-for-pocket') {
        logger.info('the job has been compledted');
      }
    });
}

const queueEvents = new QueueEvents(dailyInterestQueue.name);

const pocketInterestFailureSchema = z.object({
  entity_id: z.number(),
  pocket_id: z.number(),
  error: z.string()
});

type PocketInterestFailure = z.infer<typeof pocketInterestFailureSchema>;

const SQL_LOG_POCKET_INTEREST_ERROR = sql<PocketInterestFailure, Record<string, never>>(`
  INSERT INTO interest_job_failures (entity_id, xid, pocket_id, error)
  SELECT
    :entity_id,
    COALESCE(MAX(xid), 0) + 1,
    :pocket_id,
    :error
  FROM interest_job_failures 
  WHERE entity_id = :entity_id
`);

const SQL_ACQUIRE_ENTITY_LOCK = sql<{entity_id:number}, Record<string, never>>(`
  SELECT pg_advisory_xact_lock(:entity_id)
`);

const SQL_INCREMENT_FAILED_POCKETS_COUNT = sql<
Record<string, never>, Record<string, never>>(`
  UPDATE interest_job_summary 
  SET failed_pockets = skipped_pockets + 1 
  WHERE interest_date = CURRENT_DATE - INTERVAL '1 day'
`);

queueEvents.on('failed', async ({ jobId, failedReason }) => {
  const job = await dailyInterestQueue.getJob(jobId);
  if (!job) return;

  logger.error(failedReason);

  const { entity_id, pocket_id } = job.data;

  await sql.transaction(async trx=>{
    await SQL_ACQUIRE_ENTITY_LOCK({
      entity_id
    }).using(trx).exec();
    await SQL_LOG_POCKET_INTEREST_ERROR({
      entity_id,
      pocket_id,
      error: failedReason || 'Unknown failure'
    }).using(trx).exec();
    await SQL_INCREMENT_FAILED_POCKETS_COUNT({}).using(trx).exec();
  });
});