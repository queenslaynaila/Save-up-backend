import { Job, Queue, QueueEvents, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import Config from '../config';
import logger from '../logger';
import { awardInterest, findEligiblePocketsAndCreateJobs, Processor } from './interestProcessor';
import z from 'zod';
import { sql } from '../db';

const redis = new Redis({
  host: Config.REDIS_HOST,
  port: Config.REDIS_PORT,
  password: Config.REDIS_PASSWORD,
  maxRetriesPerRequest: null
});

export const interestCalculationQueue = new Queue('interest-queue', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 3000 }
  }
});

export async function setupDailyInterestSchedule() {
  await interestCalculationQueue.add(
    'create-daily-interest-jobs',
    {},
    {
      jobId: 'daily-interest-scheduler',
      repeat: {
        pattern: '0 0 2 * * *',
        tz: 'UTC'
      }
    }
  );
  logger.info('Scheduled daily interest job creation at 2AM UTC');
}

export function startInterestJobWorker() {
  new Worker(
    'interest-queue',
    async (job: Job) => {
      switch (job.name) {
        case 'create-daily-interest-jobs':
          logger.info('[Daily Scheduler] Finding eligible pockets and creating interest jobs');
          await findEligiblePocketsAndCreateJobs();
          break;

        case 'calculate-pocket-interest':
          logger.info(`[Interest Calculator] Processing interest for entity ${job.data.entity_id} pocket ${job.data.pocket_id}`);
          await awardInterest(job as Job<Processor>);
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
      if (job.name === 'calculate-pocket-interest') {
        logger.info('the job has been compledted');
      }
    });
}

const queueEvents = new QueueEvents(interestCalculationQueue.name);

const pocketErrorSchema = z.object({
  entity_id: z.number(),
  pocket_id: z.number(),
  error: z.string()
});

type PocketError = z.infer<typeof pocketErrorSchema>;

const SQL_LOG_POCKET_INTEREST_ERROR = sql<PocketError, Record<string, never>>(`
  INSERT INTO interest_job_failures (entity_id, xid, pocket_id, error)
  SELECT
    :entity_id,
    COALESCE(MAX(xid), 0) + 1,
    :pocket_id,
    :error
  FROM interest_job_failures 
  WHERE entity_id = :entity_id
`);

queueEvents.on('failed', async ({ jobId, failedReason }) => {
  const job = await interestCalculationQueue.getJob(jobId);
  if (!job) return;

  const { entity_id, pocket_id } = job.data;

  await SQL_LOG_POCKET_INTEREST_ERROR({
    entity_id,
    pocket_id,
    error: failedReason || 'Unknown failure'
  }).exec();
});