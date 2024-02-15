/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { expenseSchema,HttpError,idSchema,updateExpenseSchema } from '../types';
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
  const validationResult =expenseSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ error: new HttpError(400, 'Invalid expense data provided').message });
  }
  const { description, category, amount, date, user_id } =   validationResult.data;
  
    await pool.query('BEGIN');
    const query =
      'INSERT INTO expenses (description, category, amount, date, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const values = [description, category, amount, date, user_id];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: new HttpError(400, 'User with provided ID not found').message });
    }
    await updateUserTotalExpenseAmount(user_id, amount);
    await pool.query('COMMIT');
    return res.status(201).json(result.rows[0]);
  
};

export const getAllExpenses = async (req: Request, res: Response) => {
  
    const query = 'SELECT * FROM expenses';
    const result = await pool.query(query);
    const expenses = result.rows;
    if (!expenses || expenses.length === 0) {
      return res.status(404).json({ error: new HttpError(404, 'No expenses found').message });
    }
    return res.status(200).json(expenses);
  
};

export const getExpenseById = async (req: Request, res: Response) => {
  const validationResult = idSchema.safeParse(req.params.id);
  if (!validationResult.success) {
    return res.status(400).json({ error: new HttpError(400, 'Invalid expense ID').message });
  }
  const  id = validationResult.data;
  
    const query = 'SELECT * FROM expenses WHERE id = $1';
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense with submitted ID not found' });
    }
    return res.status(200).json(result.rows[0]);
  
};

export const updateExpense = async (req: Request, res: Response) => {
  const validationResultId = idSchema.safeParse(req.params.id);
  if (!validationResultId.success) {
    return res.status(400).json({ error: new HttpError(400, 'Invalid saving ID').message });}
  const id = validationResultId.data

  const userIdQuery = 'SELECT user_id FROM expenses WHERE id = $1';
  const userIdResult = await pool.query(userIdQuery, [id]);
  const userId = userIdResult.rows[0]?.user_id;

  if (userId !== req.user?.id) {
    return res.status(403).json({ error: 'You are not authorized to update this expense' });
  }
  const validationResult = updateExpenseSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ error: new HttpError(400, 'Invalid data').message });
  }

  const {description, category, amount, date,} = validationResult.data;

    const query =
      'UPDATE expenses SET description = $1, category = $2, amount = $3, date = $4 WHERE id = $5 RETURNING *';
    const values = [description, category, amount, date, id];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    return res.status(200).json(result.rows[0]);

};

export const deleteExpense = async (req: Request, res: Response) => {
  const validationResult = idSchema.safeParse(req.params.id);
  
  if (!validationResult.success) {
    return res.status(400).json({ error: new HttpError(400, 'Invalid expense ID').message });
  }
  const id = validationResult.data;
  
  const userIdQuery = 'SELECT user_id FROM expenses WHERE id = $1';
  const userIdResult = await pool.query(userIdQuery, [id]);
  const userId = userIdResult.rows[0]?.user_id;

  if (userId !== req.user?.id) {
    return res.status(403).json({ error: 'You are not authorized to delete this expense' });
  }
  
    const query = 'DELETE FROM expenses WHERE id = $1';
    const result = await pool.query(query, [id]);
    if (result.rowCount != null && result.rowCount > 0) {
      return res.status(204).json({ error: new HttpError(400, 'Expense deleted successfully').message });
    }else {
      return res.status(400).json({ error: new HttpError(400, 'Expense with provided ID not found').message });
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

let query;
const values = [];
let errorMessage;

if (user_id) {
  query = 'SELECT * FROM expenses WHERE user_id = $1';
  values.push(user_id);
  errorMessage = 'No savings found for the provided user ID';
} else if (category) {
  query = 'SELECT * FROM expenses WHERE category = $1';
  values.push(category);
  errorMessage = 'No savings found with the provided category';
} else if (month) {
  query = 'SELECT * FROM expenses WHERE EXTRACT(MONTH FROM date) = $1';
  values.push(month);
  errorMessage = 'No savings found for provided date';
} else {
  return res.status(400).json({ error: new HttpError(400, 'Invalid query parameters').message });
}

await executeQuery(res, query, values, errorMessage);
};


