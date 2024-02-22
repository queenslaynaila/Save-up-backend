import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import pool from '../../db';
import sendSms from '../../services/twilio';
import jwt, { Secret } from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export default (router: Router) => {
  router.post(
    '/',
    authMiddleware({ roles: [UserRole.ADMIN, UserRole.USER] }),
    async (req, res) => {
      const { phoneNo,securityAnswer } = req.body;
      const userQuery = 'SELECT * FROM users WHERE phone_no = $1';
      const userResult = await pool.query(userQuery, [phoneNo]);
      if (userResult.rows.length === 0) {
        return res.status(400).json({ message: 'User does not exist' });
      }
      
      const securityAnswerQuery = 'SELECT answer FROM security_answers WHERE user_id = $1';
      const securityResult = await pool.query(securityAnswerQuery, [userResult.rows[0].id]);

      if (securityResult.rows.length === 0 || !await bcrypt.compare(securityAnswer, securityResult.rows[0].answer)) {
        return res.status(401).json({ message: 'Incorrect security answer or security answer not found for the user' });
      }

      const resetToken = jwt.sign({ phoneNo }, process.env.JWT_SECRET as Secret, {
        expiresIn: '10m',
      });
      console.log('Reset token:', resetToken);
      sendSms(phoneNo, `Here is your reset token ${resetToken}. Do not share this with anyone.`);
      return res.json({ message: 'Reset token generated and sent successfully.' });
    }
  );
};
