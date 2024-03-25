import { Router } from 'express';
import bcrypt from 'bcrypt';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/auth';
import { hasPermission } from '../../middleware/hasPermission';
import { sql } from '../../db';
import { UpdatePhoneSchema } from '../../types';

const SQL_GET_USER_PASSWORD = sql<{ userId: string },{ password: string }>(
  `SELECT password FROM users WHERE id = :userId`
);
const SQL_UPDATE_PHONE = sql<{ phone_number: string; userId: string }, { phone_number: string }>(
  `UPDATE users_phone 
   SET phone_number = :phone_number 
   WHERE id = :userId
   RETURNING phone_number`
);

export default (router: Router) => {
  router.patch<{ id: string },{ phone_number: string },{ phone_number: string; userId: string },Record<string, never>>(
    '/update-phone/:id', 
    authMiddleware(), 
    async (req, res) => {
      const userId = req.params.id;
      if (!hasPermission(req, parseInt(userId))) {
        throw new HttpError(403, 'Forbidden');
      }
      const validationResult = UpdatePhoneSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new HttpError(422, 'Unprocessable Entity');
      }
      const { password, phone_number } = validationResult.data;
      const userPassword = await SQL_GET_USER_PASSWORD({ userId }).one(
        new HttpError(404, 'Not found')
      );
      if (!await bcrypt.compare(password, userPassword.password)) {
        throw new HttpError(401, 'Invalid password');
      }
      const updateResult = await SQL_UPDATE_PHONE({ phone_number, userId }).one();
      res.json(updateResult);
    });
};
