import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import pool from '../../db';
import bcrypt from 'bcrypt';

import jwt, { Secret } from 'jsonwebtoken';

export default (router: Router) => {
  router.patch(
    '/:id',
    authMiddleware({ roles: [UserRole.ADMIN, UserRole.USER] }),
    async (req, res) => {
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

        res.json({ message: 'Password updated successfully. Login' });
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
    }
  );
};
