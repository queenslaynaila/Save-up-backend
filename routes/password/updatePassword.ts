import { Router } from 'express';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';
import { resetPasswordLimiter } from '../../services/rateLimit';

const SQL_GET_PASSWORD_BY_ID = sql<{ id: number }, { pin: string }>(`
  SELECT pin FROM users WHERE id = :id
`);

const SQL_UPDATE_PASSWORD = sql<{ pin: string; id: number }, Record<string, never>>(`
  UPDATE users SET pin = :pin WHERE id = :id
`);

export default (router: Router) => {
  router.patch<Record<string, never>, { message:string }, { oldPassword: string; newPassword: string }, Record<string, never>>(
    '/update-pin', 
    authMiddleware(), 
    resetPasswordLimiter,
    async (req, res) => {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user!.id;
      const { pin: hashedPassword } = await SQL_GET_PASSWORD_BY_ID({ id: userId }).one();
      const isPasswordCorrect = await bcrypt.compare(oldPassword, hashedPassword);
      if (!isPasswordCorrect) {
        throw new HttpError(400, 'Incorrect pin');
      }
      const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
      await SQL_UPDATE_PASSWORD({ id: userId, pin: hashedNewPassword }).exec();
      
      res.json({ message: 'Password updated successfully.' });
    });
};
