import { Router } from 'express';
import bcrypt from 'bcrypt';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/auth';
import { UpdatePhoneSchema } from '../../types';
import { sql } from '../../db';

export default (router: Router) => {
  router.patch('/update-phone/:id', authMiddleware(), async (req, res) => {
    const userId = req.params.id;
    const authenticatedUserId = req.user?.id;
    if (userId !== authenticatedUserId) {
      throw new HttpError(401, 'Unauthorized');
    }
    const { password, phone_number } = req.body;

    const validationResult = UpdatePhoneSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new HttpError(400, 'Invalid data');
    }
    const userPasswordQuery = sql<{ userId: string }, { password: string }>(
      `SELECT password FROM users WHERE id = :userId`
    );
    const userPasswordResult = await userPasswordQuery({ userId }).one();

    if (!userPasswordResult || !(await bcrypt.compare(password, userPasswordResult.password))) {
      throw new HttpError(401, 'Invalid password or user not found');
    }

    const SQL_UPDATE_PHONE = sql<{ phone_number: string; userId: string }, { updatedRows: number }>(
      `UPDATE users 
       SET phone_number = :phone_number 
       WHERE id = :userId`
    );

    const result = await SQL_UPDATE_PHONE({ phone_number, userId }).one();
    if (!result) {
      throw new HttpError(401, 'Update failed');
    }

    res.json({
      message: 'Phone number updated successfully. Please log in with your new phone number.',
    });
  });
};
