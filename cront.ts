import cron from 'node-cron';
import { z } from 'zod';
import { sql } from './db';
import sendSms from './services/twilio';

const GoalSchema = z.object({
  goal_id: z.number(),
  entity_id: z.number(),
  target_at: z.date(),
  amount: z.number(),
  reminder_count: z.number(),
  last_reminder_sent_at: z.date(),
  name: z.string(),
});

type Goal = z.infer<typeof GoalSchema>;

const UpdateGoalReminderSchema = GoalSchema.pick({ 
  goal_id: true, 
  last_reminder_sent_at: true, 
  reminder_count: true 
});

type UpdateGoalReminder = z.infer<typeof UpdateGoalReminderSchema>;

const SQL_GET_OVERDUE_GOALS = sql<Record<string, never>, Goal>(`
  SELECT g.id AS goal_id, g.entity_id, g.target_at, g.target_amount AS amount,name, g.reminder_count, g.last_reminder_sent_at
  FROM goals g
  LEFT JOIN deposits d ON g.id = d.goal_id
  WHERE g.status = 'In Progress'
  AND g.target_at < NOW()  - INTERVAL '14 days'
  AND (d.created_at < NOW() - INTERVAL '30 days' OR d.created_at IS NULL)
`);

const SQL_GET_PHONE_NUMBER = sql<{ entity_id: number; }, { phone_number: string; }>(`
  SELECT phone_number
  FROM users_phone
  WHERE user_id = :entity_id;
`);

const SQL_UPDATE_GOAL_REMINDER = sql<UpdateGoalReminder, Record<string, never>>(`
  UPDATE goals 
  SET last_reminder_sent_at = :last_reminder_sent_at, reminder_count = :reminder_count
  WHERE id = :goal_id
`);

export async function remindStaleSavings() {
  console.log('Checking for stale savings...');

  const currentTime = new Date();
  const overdueSavings = await SQL_GET_OVERDUE_GOALS({}).many();
 
  for (const saving of overdueSavings) {
    const { goal_id, entity_id, amount, target_at,reminder_count , last_reminder_sent_at,name } = saving;
    const timeDifference = currentTime.getTime() - last_reminder_sent_at.getTime();
    const daysDifference = timeDifference / (1000 * 3600 * 24);

    if(reminder_count < 3 && daysDifference >= 7){
      const { phone_number } = await SQL_GET_PHONE_NUMBER({ entity_id }).one();
      const message = `Hi! A gentle reminder that your saving goal ${name} of ${amount} is overdue by 30 days. Consider taking action to reach your saving goal by ${target_at}.`;
      sendSms(phone_number, message);
      await SQL_UPDATE_GOAL_REMINDER({ goal_id, last_reminder_sent_at: currentTime, reminder_count: 1 }).exec();
    }

  }

  console.log('Stale savings reminders sent');
}

cron.schedule('0 10 */14 * *', remindStaleSavings);

