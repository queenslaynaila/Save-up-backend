import pool from '../db';
import { Request, Response } from 'express';
import { HttpError, idSchema, updateContributionsSchema, contributionsSchema } from '../types';
export const updateUserTotalContributionsAmount = async (
  userId: string,
  newContributionAmount: number
) => {
  const query = `
        UPDATE users
        SET total_contributions_amount = total_contributions_amount + $1
        WHERE id = $2
        RETURNING *`;
  await pool.query(query, [newContributionAmount, userId]);
};

export const createContributions = async (req: Request, res: Response) => {
  const validationResult = contributionsSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new HttpError(400, 'Invalid saving id, amount, or date');
  }

  const { saving_id, amount, date } = validationResult.data;

  try {
    await pool.query('BEGIN');

    const contributionQuery = `
        INSERT INTO contributions (saving_id, amount, date) 
        VALUES ($1, $2, $3) 
        RETURNING *`;
    const contributionValues = [saving_id, amount, date];

    const contributionResult = await pool.query(contributionQuery, contributionValues);

    const getUserQuery = 'SELECT user_id FROM savings WHERE id = $1';
    const getUserResult = await pool.query(getUserQuery, [saving_id]);
    const user_id = getUserResult.rows[0].user_id;

    await updateUserTotalContributionsAmount(user_id, amount);

    await pool.query('COMMIT');

    return res.status(201).json(contributionResult.rows[0]);
  } catch (error) {
    await pool.query('ROLLBACK');
    throw new HttpError(400, 'Invalid saving id');
  }
};

export const getAllContributions = async (req: Request, res: Response) => {
  const query = 'SELECT * FROM contributions';
  const result = await pool.query(query);
  const contributions = result.rows;
  if (!contributions || contributions.length === 0) {
    throw new HttpError(404, 'No contributions found');
  }
  return res.status(200).json(contributions);
};

export const updateContributions = async (req: Request, res: Response) => {
  const { id } = req.params;

  const validationResultBody = updateContributionsSchema.safeParse(req.body);

  if (!validationResultBody.success) {
    throw new HttpError(400, 'Invalid contributions data. Please provide valid values for all user fields.');
  }
  const { amount, date } = validationResultBody.data;
  const getUserIdQuery = `
  SELECT s.user_id
  FROM contributions c
  JOIN savings s ON c.savings_id = s.id
  WHERE c.id = $1
`;
  const userIdResult = await pool.query(getUserIdQuery, [id]);
  const userId = userIdResult.rows[0]?.user_id;
  if (req.user?.id !== userId) {
    throw new HttpError(403, 'Unauthorized to update contribution for this user');
  }

  const query = 'UPDATE contributions SET amount = $1, date = $2 WHERE id = $3 RETURNING *';
  const values = [amount, date, id];
  const result = await pool.query(query, values);
  const updatedContribution = result.rows[0];
  if (!updatedContribution) {
    throw new HttpError(404, 'Contribution with given ID not found');
  }
  return res.status(200).json(updateContributions);
};

export const deleteContributions = async (req: Request, res: Response) => {
  const validationResult = idSchema.safeParse(req.params.id);

  if (!validationResult.success) {
    throw new HttpError(400, 'Invalid user ID');
  }
  const id = validationResult.data;

  const query = 'DELETE FROM contributions WHERE id = $1';
  const result = await pool.query(query, [id]);
  if (result.rowCount === 0) {
    throw new HttpError(404, 'Contribution with given ID not found');
  }
  return res.status(204).json({ message: 'Contribution deleted' });
};

export const getContributionsById = async (req: Request, res: Response) => {
  const validationResult = idSchema.safeParse(req.params.id);
  if (!validationResult.success) {
    throw new HttpError(400, 'Invalid contributions ID');
  }
  const id = validationResult.data;
  const query = 'SELECT * FROM contributions WHERE id = $1';
  const result = await pool.query(query, [id]);
  if (result.rows.length === 0) {
    throw new HttpError(404, 'Contribution with provided ID not found');
  }
  return res.status(200).json(result.rows[0]);
};

export const getContributionsBySaving = async (req: Request, res: Response) => {
  const validationResult = idSchema.safeParse(req.params.saving_id);

  if (!validationResult.success) {
    throw new HttpError(400, 'Invalid saving ID');
  }
  const saving_id = validationResult.data;

  const query = 'SELECT * FROM contributions WHERE saving_id = $1';
  const result = await pool.query(query, [saving_id]);
  if (result.rows.length === 0) {
    throw new HttpError(404, 'Contribution with given savingID not found');
  }
  return res.status(200).json(result.rows);
};
