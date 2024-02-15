
import twilio from 'twilio';

import { config } from 'dotenv';

config({ path: '.env' });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const sendSms = (phone: string, message: string): void => {
  const client = twilio(accountSid, authToken);
  client.messages
    .create({
       body: message,
       from: twilioPhoneNumber,
       to: phone
     })
    .then((message) => console.log(message.sid))
    .catch((error) => console.error(error)); 
}

export default sendSms;
