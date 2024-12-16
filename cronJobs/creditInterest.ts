/* eslint-disable @typescript-eslint/no-unused-vars */
import { sql } from '../db';

const SQL_CREDIT_INTEREST = sql<Record<string, never>, Record<string, never>>(`
  CALL calculate_interest()
`);

async function creditInterest() {
  await SQL_CREDIT_INTEREST({}).exec();
}