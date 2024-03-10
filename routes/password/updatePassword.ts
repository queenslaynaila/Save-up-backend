import { Router } from 'express';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';

const SQL_UPDATE_PASSWORD = sql<
{ password: string; phone_number: string },
{ phone_number: string }
>(`UPDATE users SET password = $1 WHERE  phone_number  = :phone_number `);

export default (router: Router) => {
  router.post('/update-password', authMiddleware(), async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = req!.user;
    const passwordMatch = await bcrypt.compare(oldPassword, user!.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Old password is incorrect.' });
    }
    const hashPassword = bcrypt.hashSync(newPassword, 10);
    await SQL_UPDATE_PASSWORD({ phone_number: user!.phone_number, password: hashPassword }).exec();
    res.json({ message: 'Password updated successfully.' });
  });
};
