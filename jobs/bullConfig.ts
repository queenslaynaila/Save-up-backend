import { Job, Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import Config from '../config';
import logger from '../logger';
import { awardInterest, findEligiblePocketsAndCreateJobs, Processor } from './interestProcessor';

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
          logger.info(`[Interest Calculator] Processing interest for pocket ${job.data.pocket_id}`);
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
    .on('failed', (job, err) => {
      logger.error(`Job "${job!.name}" (id:${job!.id}) failed:`, err);
    });
}