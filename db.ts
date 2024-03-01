import {createBasicSQL} from "@m-pot/sql-query";
import { config } from 'dotenv';
config({ path: '.env' });

export const {sql, shutdown: closeDbConnection} = createBasicSQL({
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT || '5432'),
  database: process.env.PG_DATABASE,
  user:  process.env.PG_USER,
  password:  process.env.PG_PASSWORD,
  disablePooling:Boolean(process.env.PG_BOUNCER_ENABLED) || true,
  max: 60,
  ssl: Boolean(process.env.SSL) || true
});

