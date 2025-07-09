import { Job, Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import Config from '../config';
import logger from '../logger';
import { awardInterest, enqueueInterestJobs, Proccessor } from './interestProccessor';

const redis = new Redis({
  host: Config.REDIS_HOST,
  port: Config.REDIS_PORT,
  password: Config.REDIS_PASSWORD,
  maxRetriesPerRequest: null
});

export const interestQueue = new Queue('interest-queue', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 3000 }
  }
});

export async function scheduleDailyInterestJob() {
  await interestQueue.add(
    'schedule-interest-runner',
    {},
    {
      jobId: 'daily-interest-scheduler',
      repeat: {
        pattern: '0 2 * * *',
        tz: 'UTC'
      }
    }
  );
  logger.info('Scheduled daily-interest-scheduler repeatable at 2AM daily');
}

export function startInterestWorker() {
  new Worker(
    'interest-queue',
    async (job: Job) => {
      switch (job.name) {
        case 'schedule-interest-runner':
          logger.info('[Scheduler] Running enqueueInterestJobs()');
          await enqueueInterestJobs();
          break;

        case 'award-interest':
          logger.info(`[Processor] awardInterestJob for pocket ${job.data.pocket_id}`);
          await awardInterest(job as Job<Proccessor>);
          break;

        default:
          logger.warn(`Unknown job name: ${job.name}`);
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