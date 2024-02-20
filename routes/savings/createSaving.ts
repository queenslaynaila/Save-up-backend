import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import { Router } from 'express';
import { savingSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import pool from '../../db';

export default (router: Router) => {
  router.post('/', authMiddleware({ roles: [UserRole.ADMIN, UserRole.USER] }), async (req, res) => {
    const validationResult = savingSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new HttpError(400, 'Invalid saving data');
    }
    const loggedInUser = req.user?.id;
    const { user_id, description, category, target_amount, priority, target_date } =
      validationResult.data;
    if (loggedInUser !== user_id) {
      throw new HttpError(401, 'Unauthorized access ');
    }

    const savingQuery = `
            INSERT INTO savings (user_id, description, category, target_amount, priority, target_date) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *`;
    const savingValues = [user_id, description, category, target_amount, priority, target_date];
    const savingResult = await pool.query(savingQuery, savingValues);
    if (savingResult.rows.length === 0) {
      throw new HttpError(400, 'User with provided ID not found');
    }

    res.json(savingResult.rows[0]);
  });
};
