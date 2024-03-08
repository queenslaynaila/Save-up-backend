import { Router } from 'express';
import { z } from 'zod';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { hasPermission } from '../../middleware/hasPermission';
import { UpdateUserSchema } from '../../types';
import { UserSchema } from './index';

const SQL_UPDATE_USER = sql<z.infer<typeof UpdateUserSchema>, UserSchema>(
  `UPDATE users SET `
);

export default (router: Router) => {
  router.patch('/:id', authMiddleware(), async (req, res) => {
    const userId = req.params.id;
    if (!hasPermission(req, userId)) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const validationResult = UpdateUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new HttpError(
        422,
        'Invalid user data. Please provide valid values for all user fields.'
      );
    }

    const { first_name, last_name } = validationResult.data;
    const values: { id: string; first_name?: string; last_name?: string } = { id: userId };
    const  updateClauses: string[] = [];

    if (first_name) {
      updateClauses.push(`first_name = :first_name`);
      values.first_name = first_name;
    }
    if (last_name) {
      updateClauses.push(`last_name = :last_name`);
      values.last_name = last_name;
    }

    const query = SQL_UPDATE_USER({});
    const setClause =  updateClauses.join(', ');
    const extendedQuery = query.extend(`${setClause} WHERE id = :id RETURNING *`, values);
    const updatedUser = await extendedQuery.one(new HttpError(400, 'User not found'));
    res.json(updatedUser);
  });
};
