import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import pool from '../../db';
import bcrypt from 'bcrypt';

import jwt, { Secret } from 'jsonwebtoken';

export default (router: Router) => {
  router.post(
    '/reset',
    authMiddleware({ roles: [UserRole.ADMIN, UserRole.USER] }),
    async (req, res) => {
      const { newPassword, resetToken } = req.body;
        const decodedToken = jwt.verify(resetToken, process.env.JWT_SECRET as Secret) as {
          phone_no: string;
        };
        const phoneNo = decodedToken.phone_no;
        const hashPassword = bcrypt.hashSync(newPassword, 10);

        const result = await pool.query('UPDATE users SET password = $1 WHERE phone_no = $2', [
          hashPassword,
          phoneNo,
        ]);

        if (result.rowCount === 0) {
          return res.status(400).json({ message: 'User does not exist' });
        }
        res.json({ message: 'Password updated successfully. Login' });
      
    }
  );
};
