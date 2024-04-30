import { Router } from 'express';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { resetPasswordLimiter } from '../../services/rateLimit';
import { UpdatePasswordInterface, ResetPasswordRequestInterface, ResetPinInterface  } from './types';
import {  MessageInterface, GetByIdInterface } from '../../globalTypes/index';

const SQL_GET_PASSWORD_BY_ID = sql<GetByIdInterface, ResetPinInterface >(`
  SELECT pin FROM users WHERE id = :id
`);

const SQL_UPDATE_PASSWORD = sql< ResetPasswordRequestInterface, Record<string,never>>(`
  UPDATE users SET pin = :pin WHERE id = :id
`);

export default (router: Router) => {
  router.patch<Record<string,never>, MessageInterface, UpdatePasswordInterface, Record<string,never>>(
    '/update-pin', 
    authMiddleware(), 
    resetPasswordLimiter,
    async (req, res) => {
      const { old_password, new_password } = req.body;
      const userId = req.user!.id;
      const { pin: hashedPassword } = await SQL_GET_PASSWORD_BY_ID({ id: userId }).one();
      const isPasswordCorrect = await bcrypt.compare(old_password, hashedPassword);
      if (!isPasswordCorrect) {
        throw new HttpError(400, 'Incorrect pin');
      }
      const hashedNewPassword = bcrypt.hashSync(new_password, 10);
      await SQL_UPDATE_PASSWORD({ id: userId, pin: hashedNewPassword }).exec();
      
      res.json({ message: 'Password updated successfully.' });
    });
};
