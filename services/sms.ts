import https from 'follow-redirects';
import dotenv from 'dotenv';
import logger from '../logger';
import Config from '../config';

dotenv.config();

const sendSms = (to: string, text: string) => {
  const options = {
    method: 'POST',
    hostname: Config.BASE_URL,
    path: '/sms/2/text/advanced',
    headers: {
      Authorization: `App ${Config.API_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    maxRedirects: 20
  };

  const req = https.https.request(options, (res) => {
    const chunks: Uint8Array[] = [];

    res.on('data', (chunk) => {
      chunks.push(chunk);
    });

    res.on('end', () => {
      const body = Buffer.concat(chunks);
      logger.info(body.toString());
    });

    res.on('error', (error) => {
      logger.info(error);
    });
  });

  const postData = JSON.stringify({
    messages: [
      {
        destinations: [{ to }],
        from: Config.SENDER,
        text
      }
    ]
  });

  req.write(postData);
  req.end();
};

export default sendSms;