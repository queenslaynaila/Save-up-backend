import { Router } from 'express';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';
import { resetPasswordLimiter } from '../../services/rateLimit';

const SQL_UPDATE_PASSWORD = sql<{ pin: string; phone_number: string },{ phone_number: string }>(`
  UPDATE users SET pin =:pin WHERE  phone_number= :phone_number 
`);

export default (router: Router) => {
  router.patch<Record<string, never>, { message:string }, { oldPassword: string; newPassword: string }, Record<string, never>>(
    '/update-pin', 
    authMiddleware(), 
    resetPasswordLimiter,
    async (req, res) => {
      const { oldPassword, newPassword } = req.body;
      const user = req!.user;
      const passwordMatch = await bcrypt.compare(oldPassword, user!.pin);
      if (!passwordMatch) {
        throw new HttpError(401, 'Incorrect pin');
      }
      const hashPassword = bcrypt.hashSync(newPassword, 10);
      await SQL_UPDATE_PASSWORD({ phone_number: user!.phone_number, pin: hashPassword }).exec();
      res.json({ message: 'Password updated successfully.' });
    });
};
