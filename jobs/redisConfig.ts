import Redis from 'ioredis';
import Config from '../config';

export const redis = new Redis({
  host: Config.REDIS_HOST,
  port: Config.REDIS_PORT,
  password: Config.REDIS_PASSWORD,
  maxRetriesPerRequest: null
});