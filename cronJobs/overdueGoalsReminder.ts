/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { z } from 'zod';
import { sql } from '../db';
import sendSms from '../services/sms';

const pocketSchema = z.object({
  pocket_id: z.number().min(1),
  entity_id: z.number().min(1),
  target_at: z.date(),
  amount: z.number(),
  reminder_count: z.number(),
  last_reminder_sent_at: z.date(),
  name: z.string()
});

type Pocket = z.infer<typeof pocketSchema>;

const UpdatePocketReminderSchema = pocketSchema.pick({
  pocket_id: true,
  last_reminder_sent_at: true,
  reminder_count: true
});

type UpdatePocketReminder = z.infer<typeof UpdatePocketReminderSchema>;

const SQL_GET_OVERDUE_POCKETS = sql<Record<string, never>, Pocket>(`
  SELECT p.id AS pocket_id, p.entity_id, p.target_at, p.target_amount AS amount,name, p.reminder_count, p.last_reminder_sent_at
  FROM pockets p
  LEFT JOIN deposits d ON p.id = d.pocket_id
  WHERE p.status = 'In Progress'
  AND p.target_at < NOW()  - INTERVAL '14 days'
  AND (d.created_at < NOW() - INTERVAL '30 days' OR d.created_at IS NULL)
`);

const SQL_GET_PHONE_NUMBER = sql<{ entity_id: number; }, { phone_number: string; }>(`
  SELECT phone_number
  FROM users_phone
  WHERE user_id = :entity_id;
`);

const SQL_UPDATE_POCKET_REMINDER = sql<UpdatePocketReminder, Record<string, never>>(`
  UPDATE pockets 
  SET last_reminder_sent_at = :last_reminder_sent_at, reminder_count = :reminder_count
  WHERE id = :pocket_id
`);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function remindStalePockets() {
  const currentTime = new Date();
  const overduePockets = await SQL_GET_OVERDUE_POCKETS({}).many();

  for (const pocket of overduePockets) {
    const {
      pocket_id, entity_id, amount, target_at, reminder_count, last_reminder_sent_at, name
    } = pocket;
    const timeDifference = currentTime.getTime() - last_reminder_sent_at.getTime();
    const daysDifference = timeDifference / (1000 * 3600 * 24);

    if (reminder_count < 3 && daysDifference >= 7) {
      const { phone_number } = await SQL_GET_PHONE_NUMBER({ entity_id }).one();
      const message = `Hi! A gentle reminder that your saving pocket ${name} of ${amount} is overdue by 30 days. 
                       Consider taking action to reach your saving pocket by ${target_at}.`;
      sendSms(phone_number, message);
      await SQL_UPDATE_POCKET_REMINDER({
        pocket_id, last_reminder_sent_at: currentTime, reminder_count: 1
      }).exec();
    }
  }
}
