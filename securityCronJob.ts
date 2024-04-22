import { sql } from './db';
import cron from 'node-cron';
import sendSms from './services/twilio';

const SQL_GET_USERS_WITHOUT_SECURITY_QUESTIONS = sql<Record<string, never>, { user_id: number; last_reminder_sent_at: Date;  reminder_count: number  }>(`
  SELECT id AS user_id, last_reminder_sent_at, security_reminder_count 
  FROM users
  LEFT JOIN security_answers ON users.id = security_answers.user_id
  WHERE security_answers.user_id IS NULL;
`);

const SQL_GET_USER_PHONE_NUMBERS = sql<{ user_id: number }, { phone_number: string }>(`
  SELECT phone_number
  FROM users_phone
  WHERE user_id = :user_id
`);

const SQL_UPDATE_USER_REMINDERS = sql<{ user_id: number; last_reminder_sent_at: Date; security_reminder_count:number}, Record<string, never>>(`
  UPDATE users 
  SET last_reminder_sent_at = :last_reminder_sent_at,
      security_reminder_count = :security_reminder_count
  WHERE id = :user_id
`);

async function updateUserLastReminderSentTimestamp(userId: number, timestamp: Date, remindersSent: number) {
  await SQL_UPDATE_USER_REMINDERS({ user_id: userId, last_reminder_sent_at: timestamp,security_reminder_count: remindersSent }).exec();
}

export async function sendSecurityReminderSMS() {
  const currentTime = new Date();
  const userQuery = SQL_GET_USERS_WITHOUT_SECURITY_QUESTIONS({});
  const userResults = await userQuery.many();
  
  for (const user of userResults) {
    const lastReminderSent = user.last_reminder_sent_at;
    const timeDifference = currentTime.getTime() - lastReminderSent.getTime();
    const daysDifference = timeDifference / (1000 * 3600 * 24);
    const remindersSent = user.reminder_count;
    if(remindersSent < 3 && daysDifference >= 10){
      const phoneQuery = SQL_GET_USER_PHONE_NUMBERS({ user_id: user.user_id });
      const phoneNumberResult = await phoneQuery.one();
      sendSms(
        phoneNumberResult.phone_number,
        `Please take a moment to review and update your security questions to keep your account safe..`
      );
      const newCount = remindersSent + 1
      await updateUserLastReminderSentTimestamp(user.user_id, currentTime,newCount);
    }
  }
}

cron.schedule('0,10,*/10,*,*', sendSecurityReminderSMS);
  