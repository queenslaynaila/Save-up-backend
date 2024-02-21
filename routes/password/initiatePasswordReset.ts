import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import pool from '../../db';
import sendSms from '../../services/twilio';
import jwt, { Secret } from 'jsonwebtoken';
export default (router: Router) => {
  router.get(
    '/:id',
    authMiddleware({ roles: [UserRole.ADMIN, UserRole.USER] }),
    async (req, res) => {
      const { phoneNo } = req.body;
      const userQuery = 'SELECT * FROM users WHERE phone_no = $1';
      const userResult = await pool.query(userQuery, [phoneNo]);
      if (userResult.rows.length === 0) {
        return res.status(400).json({ message: 'User with provided phone number does not exist' });
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
