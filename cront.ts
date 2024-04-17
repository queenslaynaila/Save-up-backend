import cron from 'node-cron';
import { sql } from './db';
import sendSms from './services/twilio';


const SQL_GET_OVERDUE_SAVINGS = sql<Record<string,never>, { user_id:number; target_at: Date,amount:number; }>(`  
  SELECT s.user_id, s.amount, s.target_at,s.description,s.category_id
  FROM savings s
  WHERE s.status = 'In Progress' AND (DATE(CURRENT_TIMESTAMP) - DATE(s.target_at)) >= 90;  
`);

const SQL_GET_PHONE_NUMBER = sql<{ user_id:number}, {phone_number:string}>(`  
  SELECT phone_number
  FROM users_phone
  WHERE user_id = :user_id;
`);


export async function remindStaleSavings() {
  console.log('Checking for stale savings...');
  const overdueSavings = await SQL_GET_OVERDUE_SAVINGS({}).many();
 
  for (const saving of overdueSavings) {
    const { user_id,amount,target_at } = saving;
    const phone_number = await SQL_GET_PHONE_NUMBER({user_id}).one();
    if (phone_number && phone_number.phone_number) {
      const message = `Hi!  A gentle reminder that your saving of (amount: ${amount}, target date: ${target_at}) 
      is overdue by 90 days. Consider taking action to reach your saving goal.`;
      sendSms(phone_number.phone_number, message);
    }
  }

  console.log('Stale savings reminders sent');
}

cron.schedule('0 3 1 */3 0', remindStaleSavings);

