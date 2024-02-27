import { Router } from 'express';
import { z } from 'zod';
import authMiddleware from '../../middleware/auth';
import { UpdateUserSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { UserSchema } from './index';
import { sql } from '../../db';
import { hasPermission } from '../../middleware/hasPermission';

let query = 'UPDATE users SET ';
const SQL_UPDATE_USER = sql<z.infer<typeof UpdateUserSchema>, UserSchema>(query);

export default (router: Router) => {
  router.patch('/:id', authMiddleware(), async (req, res) => {

    const userId = req.params.id;
    const loggedInUserRole = req.user!.role;
    if (!hasPermission(req, userId, loggedInUserRole)) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const validationResult = UpdateUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new HttpError(422, 'Invalid user data. Please provide valid values for all user fields.');
    }
    const { first_name, last_name } = validationResult.data;
    const values: z.infer<typeof UpdateUserSchema> & { id: string } = { id: userId }; 
    if (first_name) {
      query += `first_name = :first_name, `;
      values.first_name = first_name;
    }
    if (last_name) {
      query += `last_name = :last_name, `;
      values.last_name = last_name;
    }
    query = query.slice(0, -2);
    query += ` WHERE id = :id RETURNING *`;
    values.id = userId; 

    const updatedUser = await SQL_UPDATE_USER(values).one(new HttpError(400, 'User not found'));
    res.status(200).json(updatedUser);
  });
};
