import dotenv from 'dotenv';
import { bool, cleanEnv, host, port, str } from 'envalid';

dotenv.config();

const Config = cleanEnv(process.env, {
  PORT: port({ default: 3003 }),

  DB_HOST: host(),
  DB_PORT: port({ default: 5432 }),
  DB_DATABASE: str(),
  DB_USER: str(),
  DB_PASSWORD: str(),
  DB_BOUNCER_ENABLED: bool({ default: false }),

  SWAGGER_USERNAME: str({
    default: 'admin'
  }),
  SWAGGER_PASSWORD: str({
    default: 'password'
  }),

  JWT_ISSUER: str(),
  JWT_SECRET: str(),
  JWT_REFRESH_SECRET: str(),

  SMSLEOPARD_API_KEY: str(),
  SMSLEOPARD_API_SECRET: str(),

  AWS_REGION: str(),
  AWS_ACCESS_KEY_ID: str(),
  AWS_SECRET_ACCESS_KEY: str(),
  AWS_BUCKET_NAME: str(),

  REDIS_PORT: port({ default: 6379 }),
  REDIS_HOST: host({ default: 'localhost' }),
  REDIS_PASSWORD: str()
});

export default Config;
