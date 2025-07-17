import {
  FlowProducer,
  Job,
  Queue,
  QueueEvents,
  Worker
} from 'bullmq';
import z from 'zod';
import { Redis } from 'ioredis';
import Config from '../config';
import logger from '../logger';
import { sql } from '../db';
import {
  calculateAndAwardDailyInterestForPocket,
  finalizeInterestSummary,
  findEligiblePocketsAndScheduleInterestJobs,
  InterestCalculationData, interestDate
} from './interestProcessor';

export const redis = new Redis({
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

export const flowProducer = new FlowProducer({ connection: redis });

const queueEvents = new QueueEvents(dailyInterestQueue.name);

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
          await calculateAndAwardDailyInterestForPocket(job as Job<InterestCalculationData>);
          break;

        case 'finalize-interest-summary':
          logger.info('[Finalizer] Writing summary to database');
          await finalizeInterestSummary();
          break;

        case `interest-parent-${interestDate}`:
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
      if (job.name === 'finalize-interest-summary') {
        logger.info('all interest procesed and summary written to db');
      }
    });
}

const pocketInterestFailureSchema = z.object({
  job_name: z.string(),
  standard_interest_rate: z.number(),
  locked_interest_rate: z.number(),
  next_attempt_at: z.string().date(),
  entity_id: z.number().optional(),
  pocket_id: z.number().optional(),
  error: z.string()
});

type PocketInterestFailure = z.infer<typeof pocketInterestFailureSchema>;

const SQL_LOG_POCKET_INTEREST_ERROR = sql<PocketInterestFailure, Record<string, never>>(`
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

queueEvents.on('failed', async ({ jobId, failedReason }) => {
  const job = await dailyInterestQueue.getJob(jobId);
  if (!job) return;

  const [standard_interest_rate, locked_interest_rate] = await redis.mget(
    `interest-rates:${interestDate}:Standard`,
    `interest-rates:${interestDate}:Locked`
  );

  const entity_id = job.data?.entity_id;
  const pocket_id = job.data?.pocket_id;

  if (job.name === 'calculate-interest-for-pocket' && entity_id && pocket_id) {
    await redis.sadd(
      `interest-results:${interestDate}:failed`,
      `${entity_id}-${pocket_id}`
    );
  }

  await SQL_LOG_POCKET_INTEREST_ERROR({
    job_name: job.name,
    entity_id,
    pocket_id,
    standard_interest_rate: Number(standard_interest_rate),
    locked_interest_rate: Number(locked_interest_rate),
    error: failedReason,
    next_attempt_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
  }).exec();
});
