import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import { UpdateCategorySchema,idSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import pool from '../../db';
import { z } from 'zod';

export default (router: Router) => {
  router.patch(
    '/',
    authMiddleware({ roles: [UserRole.ADMIN, UserRole.USER] }),
    async (req, res) => {
      const validationResultId = idSchema.safeParse(req.params.id);
      if (!validationResultId.success) {
        return res.status(400).json({ error: new HttpError(400, 'Invalid saving ID').message });
      }
      const id = validationResultId.data;
      const userId = req.user?.id;
      // Parse and validate the update data against the schema
      const validationResultBody = UpdateCategorySchema.safeParse(req.body);
      if (!validationResultBody.success) {
        throw new HttpError(422, 'Invalid category data');
      }
      const { name, description } = validationResultBody.data;

      let query = 'UPDATE categories SET ';
      const values = [];

      if (name) {
        query += `name = $${values.length + 1}, `;
        values.push(name);
      }
      if (description) {
        query += `description = $${values.length + 1}, `;
        values.push(description);
      }

      query += `updated_at = NOW() WHERE id = $${values.length + 1} RETURNING *`;
      values.push(id);

      const result = await pool.query(query, values);
      const updatedCategory = result.rows[0];

      if (!updatedCategory) {
        throw new HttpError(404, 'Category not found');
      }
      res.json(updatedCategory);
    }
  );
};
