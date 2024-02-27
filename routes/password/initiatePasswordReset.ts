import { Router } from 'express';
import { sql } from '../../db';
import sendSms from '../../services/twilio';
import jwt, { Secret } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserSchema,SecurityAnswerSchema} from '../../types';
export default (router: Router) => {
  router.post('/', async (req, res) => {

    const { phoneNo, securityAnswer } = req.body;
    const userQuery = 'SELECT id, first_name, last_name, role, created_at, updated_at FROM users WHERE phone_no = :phoneNo';
    const SQL_GET_USER = sql<{ phoneNo: string }, Pick<UserSchema, 'id' | 'first_name' | 'last_name' | 'role' | 'created_at' | 'updated_at'>>(userQuery);
    const user = await SQL_GET_USER({ phoneNo }).one();


    const securityAnswerQuery = 'SELECT * FROM security_answers WHERE user_id = :userId';
    const SQL_GET_SECURITY = sql<{ userId: string }, SecurityAnswerSchema>(securityAnswerQuery);
    const answer = await SQL_GET_SECURITY({ userId: user.id }).one();


    if (!(await bcrypt.compare(securityAnswer, answer.answer))) {
      return res.status(401).json({ message: 'Incorrect security answer or security answer not found for the user' });
    }

    const resetToken = jwt.sign({ phoneNo }, process.env.JWT_SECRET as Secret, {
      expiresIn: '10m',
    });
    
    sendSms(phoneNo, `Here is your reset token ${resetToken}. Do not share this with anyone.`);
    return res.json({ message: 'Reset token generated and sent successfully.' });
  });
};
