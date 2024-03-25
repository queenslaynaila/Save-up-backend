import {createBasicSQL} from "@m-pot/sql-query";
import { config } from 'dotenv';
config({ path: '.env' });

export const {sql, shutdown: closeDbConnection} = createBasicSQL({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_DATABASE,
  user:  process.env.DB_USER,
  password:  process.env.DB_PASSWORD,
  disablePooling:Boolean(process.env.DB_BOUNCER_ENABLED) || true,
  max: 60,
});

