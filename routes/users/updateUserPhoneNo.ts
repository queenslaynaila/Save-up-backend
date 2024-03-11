import { Router } from 'express';
import bcrypt from 'bcrypt';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/auth';
import { UpdatePhoneSchema } from '../../types';
import { sql } from '../../db';

const SQL_GET_USER_PASSWORD = sql<{ userId: string }, { password: string }>(
  `SELECT password FROM users WHERE id = :userId`
);
const SQL_UPDATE_PHONE = sql<{ phone_number: string; userId: string }, { phone_number: string }>(
  `UPDATE users 
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
      const authenticatedUserId = req.user!.id;

      if (userId !== authenticatedUserId) {
        throw new HttpError(401, 'Unauthorized');
      }

      const validationResult = UpdatePhoneSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new HttpError(400, 'Invalid data');
      }
      const { password, phone_number } = validationResult.data;
      const userPasswordResult = await SQL_GET_USER_PASSWORD({ userId }).one(
        new HttpError(404, 'User not found')
      );
      if (!await bcrypt.compare(password, userPasswordResult.password)) {
        throw new HttpError(401, 'Invalid password or user not found');
      }

      const updateResult = await SQL_UPDATE_PHONE({ phone_number, userId }).one();
      res.json(updateResult);
    });
};
