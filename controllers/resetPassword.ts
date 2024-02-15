import jwt, { Secret } from 'jsonwebtoken';
import { Request, Response } from 'express';
import pool from '../db';
import { HttpError } from '../types';
import bcrypt from 'bcrypt';
import sendSms from '../twilio';

export const initiatePasswordReset = async (req: Request, res: Response) => {
  const { phoneNo } = req.body;
  const userQuery = 'SELECT * FROM users WHERE phone_no = $1';
  const userResult = await pool.query(userQuery, [phoneNo]);
  if (userResult.rows.length === 0) {
    throw new HttpError(400, 'User with provided phone number does not exist');
  }
  const resetToken = jwt.sign({ phoneNo }, process.env.JWT_SECRET as Secret, { expiresIn: '10m' });
  sendSms(phoneNo, `Here is your reset token ${resetToken}. Do not share this with anyone.`);
  return res.status(200).json({ message: 'Reset token generated and sent successfully.' });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { newPassword, resetToken } = req.body;

  try {
    const decodedToken = jwt.verify(resetToken, process.env.JWT_SECRET as Secret) as {
      phone_no: string;
    };
    const phoneNo = decodedToken.phone_no;
    const hashPassword = bcrypt.hashSync(newPassword, 10);

    await pool.query('UPDATE users SET password_hash = $1 WHERE phone_no = $2', [
      hashPassword,
      phoneNo,
    ]);

    res.status(200).json({ message: 'Password updated successfully. Login' });
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(400).json({
        error: 'The reset token has expired. Please generate a new one.',
      });
    } else {
      return res.status(400).json({
        error: 'Invalid reset token.',
      });
    }
  }
};
