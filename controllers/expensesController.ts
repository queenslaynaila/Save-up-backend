import { Request, Response } from 'express';
import { expenseSchema } from '../types';
import pool from '../db';

export const updateUserTotalExpenseAmount = async (userId: string, newExpenseAmount: number) => {
  const query = `
        UPDATE users
        SET total_expenses_amount = total_expenses_amount + $1
        WHERE id = $2
        RETURNING *`;

  try {
    const result = await pool.query(query, [newExpenseAmount, userId]);

    if (result.rows.length === 0) {
      return { error: 'Failed to update total expenses amount for the user' };
    }

    return result.rows[0];
  } catch (error) {
    return { error: 'Failed to update total expenses amount for the user' };
  }
};

export const createExpense = async (req: Request, res: Response) => {
  const validatedExpense = expenseSchema.parse(req.body);
  const { description, category, amount, date, user_id } = validatedExpense;
  try {
    await pool.query('BEGIN');
    const query =
      'INSERT INTO expenses (description, category, amount, date, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const values = [description, category, amount, date, user_id];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(500).json({ error: 'Failed to create expense' });
    }
    await updateUserTotalExpenseAmount(user_id, amount);
    await pool.query('COMMIT');
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    await pool.query('ROLLBACK');
    return res.status(400).json({ message: (error as Error).message });
  }
};

export const getAllExpenses = async (req: Request, res: Response) => {
  try {
    const query = 'SELECT * FROM expenses';
    const result = await pool.query(query);
    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
};

export const getExpenseById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const query = 'SELECT * FROM expenses WHERE id = $1';
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
};

export const updateExpense = async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedExpense = expenseSchema.parse(req.body);
  const { description, category, amount, date } = validatedExpense;
  try {
    const query =
      'UPDATE expenses SET description = $1, category = $2, amount = $3, date = $4 WHERE id = $5 RETURNING *';
    const values = [description, category, amount, date, id];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const query = 'DELETE FROM expenses WHERE id = $1';
    const result = await pool.query(query, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    return res.status(204).json({ message: 'Expense deleted' });
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
};

export const getExpenseByCategory = async (req: Request, res: Response) => {
  const { category } = req.params;
  try {
    const query = 'SELECT * FROM expenses WHERE category = $1';
    const result = await pool.query(query, [category]);
    res.json(result.rows);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
};

export const getExpensesByMonth = async (req: Request, res: Response) => {
  const { month } = req.params;
  try {
    const query = 'SELECT * FROM expenses WHERE EXTRACT(MONTH FROM date) = $1';
    const values = [month];
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    return res.status(400).json({ message: (error as Error).message });
  }
};
