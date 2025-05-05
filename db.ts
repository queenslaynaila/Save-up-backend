import { createBasicSQL } from '@m-pot/sql-query';
import Config from './config';

export const { sql, shutdown: closeDbConnection } = createBasicSQL({
  host: Config.DB_HOST,
  port: Config.DB_PORT,
  database: Config.DB_DATABASE,
  user: Config.DB_USER,
  password: Config.DB_PASSWORD,
  disablePooling: Config.DB_BOUNCER_ENABLED,
  max: 60
});