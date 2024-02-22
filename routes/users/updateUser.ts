import { Router } from 'express';
import { UserRole } from '../../types';
import authMiddleware from '../../middleware/auth';
import { UpdateUserSchema, idSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import pool from '../../db';

export default (router: Router) => {
  router.patch(
    '/:id',
    authMiddleware(),
    async (req, res) => {
      const validationResult = idSchema.safeParse(req.params.id);
      if (!validationResult.success) {
        throw new HttpError(422, 'Invalid user ID');
      }
      const userId = validationResult.data;
      if (userId !== req.user?.id) {
        throw new HttpError(401, 'Unauthorized access ');
      }
      const validationResultBody = UpdateUserSchema.safeParse(req.body);

      if (!validationResultBody.success) {
        throw new HttpError(
          422,
          'Invalid user data. Please provide valid values for all user fields.'
        );
      }

      const { first_name, last_name } = validationResultBody.data;
      let query = 'UPDATE users SET ';
      const values = [];

      if (first_name) {
        query += `first_name = $${values.length + 1}, `;
        values.push(first_name);
      }
      if (last_name) {
        query += `last_name = $${values.length + 1}, `;
        values.push(last_name);
      }

      query = query.slice(0, -2);

      query += ` WHERE id = $${values.length + 1} RETURNING *`;
      values.push(userId);

      const result = await pool.query(query, values);
      const updatedUser = result.rows[0];

      if (!updatedUser) {
        throw new HttpError(400, 'User with given ID not found');
      }

      res.status(200).json(updatedUser);
    }
  );
};
