import { Router } from 'express';
import { sql } from '../../db';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';

export default (router: Router) => {
  router.post('/reset', async (req, res) => {

    const { newPassword, resetToken } = req.body;
    const decodedToken = jwt.verify(resetToken, process.env.JWT_SECRET as Secret) as {
      phone_no: string;
    };
    const phoneNo = decodedToken.phone_no;
    const hashPassword = bcrypt.hashSync(newPassword, 10);

    const query = `UPDATE users SET password = $1 WHERE phone_no = :phoneNo`;
    const SQL_RESET_PASSWORD = sql<
    { password: string, phone_no: string }, { phoneNo: string }>(query);

    await SQL_RESET_PASSWORD({ phone_no:phoneNo, password: hashPassword }).exec();

    res.json({ message: 'Password updated successfully. Login' });
  });
};
