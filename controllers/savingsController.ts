import { Request, Response } from 'express';
import { savingSchema, HttpError } from '../types';
import pool from '../db';

export const updateUserTotalTargetedAmount = async (
  userId: string,
  newSavingTargetAmount: number
) => {
  const query = `
        UPDATE users
        SET total_targeted_amount = total_targeted_amount + $1
        WHERE id = $2
        RETURNING *`;
  try {
    await pool.query(query, [newSavingTargetAmount, userId]);
  } catch (error) {
    throw new HttpError(500, 'Failed to update total targeted amount for the user');
  }
};

export const getAllSavings = async (req: Request, res: Response) => {
  try {
    const query = 'SELECT * FROM savings';
    const result = await pool.query(query);
    return res.status(200).json(result.rows);
  } catch (error) {
    throw new HttpError(400, (error as Error).message);
  }
};

export const createSaving = async (req: Request, res: Response) => {
  const validatedSavings = savingSchema.parse(req.body);
  try {
    await pool.query('BEGIN');
    const { user_id, description, category, target_amount, priority, target_date } =
      validatedSavings;
    const savingQuery = `
            INSERT INTO savings (user_id, description, category, target_amount, priority, target_date) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *`;
    const savingValues = [user_id, description, category, target_amount, priority, target_date];
    const savingResult = await pool.query(savingQuery, savingValues);
    await updateUserTotalTargetedAmount(user_id, target_amount);
    await pool.query('COMMIT');
    return res.status(201).json(savingResult.rows[0]);
  } catch (error) {
    await pool.query('ROLLBACK');
    throw new HttpError(400, (error as Error).message);
  }
};

export const getSavingById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const query = 'SELECT * FROM savings WHERE id = $1';
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Saving not found' });
    }
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    throw new HttpError(400, (error as Error).message);
  }
};

export const updateSaving = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const validatedSavings = savingSchema.parse(req.body);
    const {
      description,
      category,
      target_amount,
      contributed_amount,
      priority,
      status,
      target_date,
      start_date,
    } = validatedSavings;
    const query = `
            UPDATE savings 
            SET 
                description = $1,
                category = $2,
                target_amount = $3,
                contributed_amount = $4,
                priority = $5,
                status = $6,
                target_date = $7,
                start_date = $8 
            WHERE 
                id = $9 
            RETURNING *`;
    const values = [
      description,
      category,
      target_amount,
      contributed_amount,
      priority,
      status,
      target_date,
      start_date,
      id,
    ];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Saving not found' });
    }
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    throw new HttpError(400, (error as Error).message);
  }
};

export const deleteSaving = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const query = 'DELETE FROM savings WHERE id = $1';
    const result = await pool.query(query, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Saving not found' });
    }
    return res.status(204).json();
  } catch (error) {
    throw new HttpError(400, (error as Error).message);
  }
};

export const getSavingsByCategory = async (req: Request, res: Response) => {
  const { category } = req.params;
  try {
    const query = 'SELECT * FROM savings WHERE category = $1';
    const result = await pool.query(query, [category]);
    res.json(result.rows);
  } catch (error) {
    throw new HttpError(400, (error as Error).message);
  }
};

export const getSavingsByStatus = async (req: Request, res: Response) => {
  const { status } = req.params;
  try {
    const query = 'SELECT * FROM savings WHERE status = $1';
    const result = await pool.query(query, [status]);
    res.json(result.rows);
  } catch (error) {
    throw new HttpError(400, (error as Error).message);
  }
};

export const getSavingsByPriority = async (req: Request, res: Response) => {
  const { priority } = req.params;
  try {
    const query = 'SELECT * FROM savings WHERE priority = $1';
    const result = await pool.query(query, [priority]);
    res.json(result.rows);
  } catch (error) {
    throw new HttpError(400, (error as Error).message);
  }
};

export const getUserSavings = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const query = 'SELECT * FROM savings WHERE user_id = $1';
    const { rows } = await pool.query(query, [id]);
    return res.status(200).json(rows);
  } catch (error) {
    throw new HttpError(400, (error as Error).message);
  }
};
