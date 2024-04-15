import { Router  } from 'express';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import { verifyResetToken } from '../../middleware/resetTokenMIddleware'

const SQL_RESET_PASSWORD = sql<{ pin: string; id:number }, Record<string, never>>(`
  UPDATE users SET pin = :pin  WHERE  user_id = :id
`);

export default (router: Router) => {
  router.post<string, Record<string, never>, { message: string }, { new_password: string; id:number }, Record<string, never>>(
    '/reset',
    verifyResetToken,
    async (req, res) => {
      const { new_password } = req.body;
      const user_id = req.user!.id;
      const hashPassword = bcrypt.hashSync(new_password, 10);
      await SQL_RESET_PASSWORD({ id: user_id, pin: hashPassword }).exec();
      res.json({ message: 'Password updated successfully. Login' });
    });
};