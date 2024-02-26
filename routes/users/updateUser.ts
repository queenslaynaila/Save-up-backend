import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { UpdateUserSchema, idSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { UserSchema } from './index';
import { sql } from '../../db';

export default (router: Router) => {
  router.patch('/:id', authMiddleware(), async (req, res) => {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const values: any = {}; 

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

    const SQL_UPDATE_USER = sql<{ id: string; first_name?: string; last_name?: string }, UserSchema>(
      query
    );
    const updatedUser = await SQL_UPDATE_USER(values).one();

    if (!updatedUser) {
      throw new HttpError(400, 'User with given ID not found');
    }

    res.status(200).json(updatedUser);
  });
};
