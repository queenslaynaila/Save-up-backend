import Config from "../config";
import HttpError from "../httpError";
import logger from "../logger";

const BASE_URL = 'https://api.smsleopard.com/v1/sms/send';

const sendSMS = async(
    destination: string,
    message: string,
    source: string = 'sms_leopard'
) => {
  const credentials = `${Config.SMSLEOPARD_API_KEY}:${Config.SMSLEOPARD_API_SECRET}`;
  const encodedCreds = Buffer.from(credentials).toString('base64');

  const params = new URLSearchParams({
    message: message,
    destination: destination,
    source: source
  });

  const url = `${BASE_URL}?${params.toString()}`;

  return fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${encodedCreds}`,
    }
  })
      .then(async(res) => {
        logger.info(`Response Status: ${res.status}`);

        if (!res.ok) {
          return res.text().then((text) => {
            logger.info(text);
            throw new HttpError(500, { message: `Failed to send SMS: ${res.statusText}` });
          });
        }

        return res.json().then((data) => {
          logger.info('SMS sent successfully', data);
        });
      })
      .catch((error) => {
        logger.error('Error sending SMS:', error);
      });
};

export default sendSMS;
