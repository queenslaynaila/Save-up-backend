import { Router } from 'express';
import bcrypt from 'bcrypt';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/auth';
import { UpdatePhoneSchema } from '../../types'; 
import pool from '../../db';

export default (router: Router) => {
  router.patch('/update-phone/:id', 
  authMiddleware(),
  async (req, res) => {
    const userId = req.params.id;
    const authenticatedUserId = req.user?.id;
    if (userId !== authenticatedUserId) {
      throw new HttpError(401, 'Unauthorized');
    }
    const { password, newPhoneNumber } = req.body;

    const validationResult = UpdatePhoneSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new HttpError(400, 'Invalid phone number');
    }

    const userQuery = 'SELECT * FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [userId]);
    const user = userResult.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new HttpError(401, 'Invalid password');
    }

    const updateQuery = 'UPDATE users SET phone_number = $1 WHERE id = $2';
    await pool.query(updateQuery, [newPhoneNumber, userId]);

    res.json({ message: 'Phone number updated successfully. Please log in with your new phone number.' });
  });
};
