import { sql } from '../db';

const SQL_CREDIT_INTEREST = sql<Record<string, never>, Record<string, never>>(`
  CALL calculate_interest()
`);

export default async function creditInterest() {
  console.log('Crediting Interest...');
  await SQL_CREDIT_INTEREST({}).exec()
  console.log('Interest credits have all been updated');
}