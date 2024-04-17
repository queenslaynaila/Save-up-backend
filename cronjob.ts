import { sql } from './db';
import sendSms from './services/twilio';

const SQL_GET_USER_PHONE_NUMBERS = sql<Record<string,never>, {  phone_numbers: string[] }>(`
      SELECT phone_number FROM users_phone
`);

export async function sendSecurityReminderSMS() {
  const query = SQL_GET_USER_PHONE_NUMBERS({});
  const results = await query.many();
  results.forEach((result) => {
    const phone_numbers = result.phone_numbers;
    phone_numbers.forEach((phone_number) => {
      sendSms(
        phone_number,
        `Please take a moment to review and update your security questions to keep your account safe..`
      );
    });
  });
}
  