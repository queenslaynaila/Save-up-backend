/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import pool from '../db';
import { savingSchema, HttpError, idSchema, updateSavingSchema } from '../types';

export const updateUserTotalTargetedAmount = async (
  userId: string,
  newSavingTargetAmount: number
) => {
  const query = `
    UPDATE users
    SET total_targeted_amount = total_targeted_amount + $1
    WHERE id = $2
    RETURNING *`;

  await pool.query(query, [newSavingTargetAmount, userId]);
};

export const getAllSavings = async (req: Request, res: Response) => {
  const query = 'SELECT * FROM savings';
  const result = await pool.query(query);
  const savings = result.rows;
  if (!savings ) {
    throw new HttpError(404, 'No savings found');
  }
  return res.status(200).json(savings);
};

export const createSaving = async (req: Request, res: Response) => {
  const validationResult = savingSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new HttpError(400, 'Invalid saving data');
  }
  const loggedInUser = req.user?.id
  const { user_id, description, category, target_amount, priority, target_date } =
  validationResult.data;
  if (loggedInUser !== user_id) {
    throw new HttpError(401, 'Unauthorized access ');
  }
  await pool.query('BEGIN');

  const savingQuery = `
            INSERT INTO savings (user_id, description, category, target_amount, priority, target_date) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *`;
  const savingValues = [user_id, description, category, target_amount, priority, target_date];
  const savingResult = await pool.query(savingQuery, savingValues);
  if (savingResult.rows.length === 0) {
    await pool.query('ROLLBACK');
   throw new HttpError(400, 'User with provided ID not found');
  }
  await updateUserTotalTargetedAmount(user_id, target_amount);
  await pool.query('COMMIT');
  res.status(201).json(savingResult.rows[0]);
};

export const getSavingById = async (req: Request, res: Response) => {
  const validationResult = idSchema.safeParse(req.params.id);
  if (!validationResult.success) {
    throw new HttpError(400, 'Invalid saving ID');
  }
  const id = validationResult.data;
  const userId = req.user?.id;
  
  const query = 'SELECT * FROM savings WHERE id = $1 AND user_id = $2';
  const result = await pool.query(query, [id, userId]);
  
  if (!result || result.rows.length === 0) {
    throw new HttpError(400, 'Saving with submitted ID not found');
  }
  
  res.status(200).json(result.rows[0]);
};


export const updateSaving = async (req: Request, res: Response) => {
  const savingId = req.params.id;
  const validationResult = idSchema.safeParse(savingId);
  if (!validationResult.success) {
    return res.status(400).json({ error: new HttpError(400, 'Invalid saving ID').message });
  }
  const userId = req.user?.id;

  const validatedSavings = updateSavingSchema.safeParse(req.body);
  if (!validatedSavings.success) {
    throw new HttpError(422, 'Invalid saving data');
  }
  const { description, category, target_amount, priority, target_date } = validatedSavings.data;

  let query = 'UPDATE savings SET ';
  const values = [];
  if (description) {
    query += `description = $${values.length + 1}, `;
    values.push(description);
  }
  if (category) {
    query += `category = $${values.length + 1}, `;
    values.push(category);
  }
  if (target_amount) {
    query += `target_amount = $${values.length + 1}, `;
    values.push(target_amount);
  }
  if (priority) {
    query += `priority = $${values.length + 1}, `;
    values.push(priority);
  }
  if (target_date) {
    query += `target_date = $${values.length + 1}, `;
    values.push(target_date);
  }
  query = query.slice(0, -2);
  query += ` WHERE user_id = $${userId} AND id = $${values.length + 1} RETURNING *`;
  values.push(userId)

  const result = await pool.query(query, values);
  const updatedSaving = result.rows[0];

  if (!updatedSaving) {
    throw new HttpError(422, 'Saving with given ID not found')
  }

  return res.status(200).json(updatedSaving);
};

export const deleteSaving = async (req: Request, res: Response) => {
  const validationResult = idSchema.safeParse(req.params.id);
  if (!validationResult.success) {
    throw new HttpError(400, 'Invalid saving ID');
  }
  const id = validationResult.data;
  const userId = req.user?.id;
  const query = 'DELETE FROM savings WHERE id = $1 AND user_id = $2';
  const result = await pool.query(query, [id, userId]);
  
  
  if (result.rowCount != null && result.rowCount > 0) {
    res.status(204).json({ message: 'Saving deleted successfully' });
  } else {
    throw new HttpError(400, 'Saving with provided ID not found');
  }
};

const executeQuery = async (res: Response, query: string, values: any[], errorMessage: string) => {
  const result = await pool.query(query, values);
  if (result.rows.length > 0) {
    res.status(200).json(result.rows);
  } else {
    throw new HttpError(404, errorMessage)
  }
};

export const getSavings = async (req: Request, res: Response) => {
  const { user_id, category, priority, status } = req.query;
  const logged_in_user_id = req.user?.id;
  let query = 'SELECT * FROM savings WHERE user_id = $1';
  const values = [user_id];
  let errorMessage = 'No savings found for the provided user ID';

  if (user_id !== logged_in_user_id) {
    throw new HttpError(403, 'Unauthorized access') ;
  }

  if (category) {
    query += ' AND category = $2';
    values.push(category);
  }

  if (priority) {
    query += ' AND priority = $' + (values.length + 1);
    values.push(priority);
  }

  if (status) {
    query += ' AND status = $' + (values.length + 1);
    values.push(status);
  }

  errorMessage = 'No savings found for the given query';

  await executeQuery(res, query, values, errorMessage);
}
