/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { expenseSchema, HttpError, idSchema, updateExpenseSchema } from '../types';
import pool from '../db';

export const updateUserTotalExpenseAmount = async (userId: string, newExpenseAmount: number) => {
  const query = `
        UPDATE users
        SET total_expenses_amount = total_expenses_amount + $1
        WHERE id = $2
        RETURNING *`;

  await pool.query(query, [newExpenseAmount, userId]);
};

export const createExpense = async (req: Request, res: Response) => {
  const validationResult = expenseSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new HttpError(400, 'Invalid expense data provided');
  }
  const { description, category, amount, date, user_id } = validationResult.data;

  await pool.query('BEGIN');
  const query =
    'INSERT INTO expenses (description, category, amount, date, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *';
  const values = [description, category, amount, date, user_id];
  const result = await pool.query(query, values);
  if (result.rows.length === 0) {
    await pool.query('ROLLBACK');
    throw new HttpError(400, 'User with provided ID not found');
  }
  await updateUserTotalExpenseAmount(user_id, amount);
  await pool.query('COMMIT');
  return res.status(201).json(result.rows[0]);
};

export const getAllExpenses = async (req: Request, res: Response) => {
  const query = 'SELECT * FROM expenses';
  const result = await pool.query(query);
  const expenses = result.rows;
  if (!expenses) {
    throw new HttpError(404, 'No expenses found');
  }
  return res.status(200).json(expenses);
};

export const getExpenseById = async (req: Request, res: Response) => {
  const validationResult = idSchema.safeParse(req.params.id);
  if (!validationResult.success) {
    throw new HttpError(400, 'Invalid expense ID');
  }
  const id = validationResult.data;
  const userId = req.user?.id;
  const query = 'SELECT * FROM expenses WHERE id = $1 AND user_id = $2';
  const result = await pool.query(query, [id,userId]);
  if (result.rows.length === 0) {
    throw new HttpError(404, 'Expense with submitted ID not found');
  }
  return res.status(200).json(result.rows[0]);
};

export const updateExpense = async (req: Request, res: Response) => {
  const validationResultId = idSchema.safeParse(req.params.id);
  if (!validationResultId.success) {
    return res.status(400).json({ error: new HttpError(400, 'Invalid saving ID').message });
  }
  const id = validationResultId.data;
  const userId = req.user?.id;

  const validationResult = updateExpenseSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new HttpError(403, 'Invalid data');
  }

  const { description, category, amount, date } = validationResult.data;

  const query =
    'UPDATE expenses SET description = $1, category = $2, amount = $3, date = $4 WHERE id = $5 AND user_id = $6 RETURNING *';
  const values = [description, category, amount, date, id,userId];
  const result = await pool.query(query, values);
  if (result.rows.length === 0) {
    throw new HttpError(404, 'Expense not found');
  }
  return res.status(200).json(result.rows[0]);
};

export const deleteExpense = async (req: Request, res: Response) => {
  const validationResult = idSchema.safeParse(req.params.id);

  if (!validationResult.success) {
    throw new HttpError(403, 'Invalid expense ID');
  }
  const id = validationResult.data;
  const userId = req.user?.id;
  const query = 'DELETE FROM expenses WHERE id = $1 AND user_id = $2';
  const result = await pool.query(query, [id,userId]);
  if (result.rowCount != null && result.rowCount > 0) {
    return res.status(204).json({ message: 'Expense deleted successfully' });
  } else {
    throw new HttpError(400, 'Expense with provided ID not found');
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



export const getExpenses = async (req: Request, res: Response) => {
  const { user_id, category, month } = req.query;
  const logged_in_user_id = req.user?.id;
  let query = 'SELECT * FROM expenses WHERE user_id = $1';
  const values = [user_id];
  let errorMessage = 'No expenses found for the provided user ID';

  if (user_id !== logged_in_user_id) {
    throw new HttpError(403, 'Unauthorized access') ;
  }

  if (category) {
    query += ' AND category = $2';
    values.push(category);
  }

  if (month) {
    query += ' AND EXTRACT(MONTH FROM date) = $'  + (values.length + 1);
    values.push(month);
  }

  errorMessage = 'No expenses found for the given query';

  await executeQuery(res, query, values, errorMessage);
}

