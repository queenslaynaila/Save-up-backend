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
  if (!savings || savings.length === 0) {
    return res.status(404).json({ error: new HttpError(404, 'No savings found').message });
  }
  return res.status(200).json(savings);
};

export const createSaving = async (req: Request, res: Response) => {
  const validationResult = savingSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ error: new HttpError(400, 'Invalid saving data').message });
  }
  const { user_id, description, category, target_amount, priority, target_date } =
    validationResult.data;

  await pool.query('BEGIN');

  const savingQuery = `
            INSERT INTO savings (user_id, description, category, target_amount, priority, target_date) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *`;
  const savingValues = [user_id, description, category, target_amount, priority, target_date];
  const savingResult = await pool.query(savingQuery, savingValues);
  if (savingResult.rows.length === 0) {
    await pool.query('ROLLBACK');
    return res
      .status(400)
      .json({ error: new HttpError(400, 'User with provided ID not found').message });
  }
  await updateUserTotalTargetedAmount(user_id, target_amount);
  await pool.query('COMMIT');
  res.status(201).json(savingResult.rows[0]);
};

export const getSavingById = async (req: Request, res: Response) => {
  const validationResult = idSchema.safeParse(req.params.id);
  if (!validationResult.success) {
    return res.status(400).json({ error: new HttpError(400, 'Invalid saving ID').message });
  }
  const id = validationResult.data;

  const query = 'SELECT * FROM savings WHERE id = $1';
  const result = await pool.query(query, [id]);
  if (!result || result.rows.length === 0) {
    return res
      .status(400)
      .json({ error: new HttpError(400, 'Saving with submitted ID not found').message });
  }
  res.status(200).json(result.rows[0]);
};

export const updateSaving = async (req: Request, res: Response) => {
  // Extract saving ID from request parameters
  const savingId = req.params.id;

  // Validate saving ID
  const validationResult = idSchema.safeParse(savingId);
  if (!validationResult.success) {
    return res.status(400).json({ error: new HttpError(400, 'Invalid saving ID').message });
  }

  // Retrieve user ID associated with the saving
  const userIdQuery = 'SELECT user_id FROM savings WHERE id = $1';
  const userIdResult = await pool.query(userIdQuery, [savingId]);
  const userId = userIdResult.rows[0]?.user_id;

  // Check if the user is authorized to update the saving
  if (userId !== req.user?.id) {
    return res.status(403).json({ error: 'You are not authorized to update this saving' });
  }

  // Validate and extract saving data from the request body
  const validatedSavings = updateSavingSchema.safeParse(req.body);
  if (!validatedSavings.success) {
    return res.status(400).json({ error: new HttpError(400, 'Invalid saving data').message });
  }
  const { description, category, target_amount, priority, target_date } = validatedSavings.data;

  // Construct the SQL update query based on provided fields
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
  query += ` WHERE id = $${values.length + 1} RETURNING *`;
  values.push(savingId);

  // Execute the update query and retrieve the updated saving
  const result = await pool.query(query, values);
  const updatedSaving = result.rows[0];

  // Check if the saving was successfully updated
  if (!updatedSaving) {
    return res
      .status(400)
      .json({ error: new HttpError(400, 'Saving with given ID not found').message });
  }

  // Return the updated saving
  return res.status(200).json(updatedSaving);
};

export const deleteSaving = async (req: Request, res: Response) => {
  const validationResult = idSchema.safeParse(req.params.id);

  if (!validationResult.success) {
    return res.status(400).json({ error: new HttpError(400, 'Invalid user ID').message });
  }
  const id = validationResult.data;
  const userIdQuery = 'SELECT user_id FROM savings WHERE id = $1';
  const userIdResult = await pool.query(userIdQuery, [id]);
  const userId = userIdResult.rows[0]?.user_id;

  if (userId !== req.user?.id) {
    return res.status(403).json({ error: 'You are not authorized to update this saving' });
  }
  const query = 'DELETE FROM savings WHERE id = $1';
  const result = await pool.query(query, [id]);
  if (result.rowCount != null && result.rowCount > 0) {
    return res
      .status(204)
      .json({ error: new HttpError(400, 'Saving deleted successfully').message });
  } else {
    return res
      .status(400)
      .json({ error: new HttpError(400, 'Saving with provided ID not found').message });
  }
};
const executeQuery = async (res: Response, query: string, values: any[], errorMessage: string) => {
  const result = await pool.query(query, values);
  if (result.rows.length > 0) {
    res.status(200).json(result.rows);
  } else {
    return res.status(404).json({ error: new HttpError(404, errorMessage).message });
  }
};

export const getSavings = async (req: Request, res: Response) => {
  const { user_id, category, priority, status } = req.query;
  const logged_in_user_id = req.user.id; // assuming the logged-in user ID is available in the request

  let query = 'SELECT * FROM savings WHERE user_id = $1';
  const values = [user_id];
  let errorMessage = 'No savings found for the provided user ID';

  if (user_id !== logged_in_user_id) {
    return res.status(403).json({ error: new HttpError(403, 'Unauthorized access').message });
  }

  if (category) {
    query += ' AND category = $2';
    values.push(category);
    errorMessage = 'No savings found with the provided category';
  }

  if (priority) {
    query += ' AND priority = $' + (values.length + 1);
    values.push(priority);
    errorMessage = 'No savings found with the provided priority';
  }

  if (status) {
    query += ' AND status = $' + (values.length + 1);
    values.push(status);
    errorMessage = 'No savings found with the provided status';
  }

  await executeQuery(res, query, values, errorMessage);
};
