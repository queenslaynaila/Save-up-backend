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
  
    const query = 'DELETE FROM expenses WHERE id = $1';
    const result = await pool.query(query, [id]);
    if (result.rowCount != null && result.rowCount > 0) {
      return res.status(204).json({ error: new HttpError(400, 'Expense deleted successfully').message });
    }else {
      return res.status(400).json({ error: new HttpError(400, 'Expense with provided ID not found').message });
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
