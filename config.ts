require('dotenv').config()
import {bool, cleanEnv, host, port, str} from 'envalid'

const Config = cleanEnv(process.env, {
  LOG_LEVEL: str({default: 'debug'}),

  PORT: port({default: 3003 }),

  DB_HOST: host(),
  DB_PORT: port({default: 5432}),
  DB_DATABASE: str(),
  DB_USER: str(),
  DB_PASSWORD: str(),
  DB_BOUNCER_ENABLED: bool({default: false}),

  SWAGGER_USERNAME: str({
    default: 'admin',
  }),
  SWAGGER_PASSWORD: str({
    default: 'password',
  }),

  JWT_ISSUER: str(),
  JWT_SECRET: str(),
  JWT_REFRESH_SECRET: str(),

  SMSLEOPARD_API_KEY: str(),
  SMSLEOPARD_API_SECRET: str(),

  AWS_REGION: str(),
  AWS_ACCESS_KEY_ID: str(),
  AWS_SECRET_ACCESS_KEY: str(),
  AWS_BUCKET_NAME: str()
})

export default Config
