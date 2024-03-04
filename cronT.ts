import cron from 'node-cron';
import { sql } from './db';

export async function updateSavingStatus() {

  const totalContributionsQuery = `
            SELECT saving_id, COALESCE(SUM(amount), 0) AS total_contributions
            FROM contributions
            GROUP BY saving_id;
        `;
  const totalContributions = await sql<Record<string, never>, { saving_id: string; total_contributions: number }>(totalContributionsQuery)({}).many();

  console.log('Updating savings status...');

  for (const contribution of totalContributions) {
    const { saving_id, total_contributions } = contribution;

    const targetAmountQuery = `
                SELECT target_amount, target_date
                FROM savings
                WHERE id = :savingId;
            `;
    const savingInfo = await sql<{ savingId: string }, { target_amount: number; target_date: Date }>(targetAmountQuery)({ savingId: saving_id }).one();
    const { target_amount, target_date } = savingInfo;

    if (total_contributions >= target_amount) {
      await sql(`UPDATE savings SET status = 'Completed', completed_date = CURRENT_DATE WHERE id = :savingId`)({ savingId: saving_id }).exec();
    } else if (new Date() > new Date(target_date.getTime() + 90 * 24 * 60 * 60 * 1000)) {
      await sql(`UPDATE savings SET status = 'Dormant' WHERE id = :savingId`)({ savingId: saving_id }).exec();
    }
  }

  console.log('Savings status updated');

}

cron.schedule('0 3 * * *', updateSavingStatus); 
