import { contributionsSchema, HttpError } from '../types';
import pool from '../db';
import { Request, Response } from 'express';

export const updateUserTotalContributionsAmount = async (
  userId: string,
  newContributionAmount: number
) => {
  const query = `
        UPDATE users
        SET total_contributions_amount = total_contributions_amount + $1
        WHERE id = $2
        RETURNING *`;

  const result = await pool.query(query, [newContributionAmount, userId]);

  if (!result) {
    throw new HttpError(500, 'Failed to update total contributions amount for the user');
  }
};
export const createContributions = async (req: Request, res: Response) => {
  const validatedContributions = contributionsSchema.parse(req.body);
  const { saving_id, amount, date } = validatedContributions;

  await pool.query('BEGIN');

  const contributionQuery = `
        INSERT INTO contributions (saving_id, amount, date) 
        VALUES ($1, $2, $3) 
        RETURNING *`;
  const contributionValues = [saving_id, amount, date];

  const contributionResult = await pool.query(contributionQuery, contributionValues);

  if (contributionResult.rows.length === 0) {
    await pool.query('ROLLBACK');
    throw new HttpError(500, 'Failed to create contribution');
  }

  const getUserQuery = 'SELECT user_id FROM savings WHERE id = $1';
  const getUserResult = await pool.query(getUserQuery, [saving_id]);
  const user_id = getUserResult.rows[0].user_id;

  await updateUserTotalContributionsAmount(user_id, amount);

  await pool.query('COMMIT');

  return res.status(201).json(contributionResult.rows[0]);
};

export const getAllContributions = async (req: Request, res: Response) => {
  const query = 'SELECT * FROM contributions';
  const result = await pool.query(query);
  if (!result) {
    throw new HttpError(500, 'Failed to fetch contributions');
  }
  return res.status(200).json(result.rows);
};

export const getContributionsById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const query = 'SELECT * FROM contributions WHERE id = $1';
  const result = await pool.query(query, [id]);
  if (result.rows.length === 0) {
    throw new HttpError(404, 'Contribution not found');
  }
  return res.status(200).json(result.rows[0]);
};

export const updateContributions = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount, date } = req.body;
  const query = 'UPDATE contributions SET amount = $1, date = $2 WHERE id = $3 RETURNING *';
  const values = [amount, date, id];
  const result = await pool.query(query, values);
  if (result.rows.length === 0) {
    throw new HttpError(404, 'Contribution not found');
  }
  return res.status(200).json(result.rows[0]);
};

export const deleteContributions = async (req: Request, res: Response) => {
  const { id } = req.params;
  const query = 'DELETE FROM contributions WHERE id = $1';
  const result = await pool.query(query, [id]);
  if (result.rowCount === 0) {
    throw new HttpError(404, 'Contribution not found');
  }
  return res.status(204).json({ message: 'Contribution deleted' });
};

export const getContributionsBySaving = async (req: Request, res: Response) => {
  const { saving_id } = req.params;
  const query = 'SELECT * FROM contributions WHERE saving_id = $1';
  const result = await pool.query(query, [saving_id]);
  if (result.rows.length === 0) {
    throw new HttpError(404, 'Contribution not found');
  }
  return res.status(200).json(result.rows);
};
