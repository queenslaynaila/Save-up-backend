import { Request, Response  } from 'express';
import pool from '../db';
import jwt, { Secret } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { userSchema, HttpError } from '../types';

const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as Secret, { expiresIn: '1h' });
};

export const createUser = async (req: Request, res: Response ) => {
  try {
    const validatedUser = userSchema.parse(req.body);
    const { first_name, last_name, email, phone_no, password } = validatedUser;
    const password_hash = bcrypt.hashSync(password, 10);
    const userQuery = `
      INSERT INTO users (first_name, last_name, email, phone_no, password_hash, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *`;
    const userValues = [first_name, last_name, email, phone_no, password_hash];
    const userResult = await pool.query(userQuery, userValues);
    const user = userResult.rows[0];
    const token = generateToken(user.id);
    user.token = token;
    return res.json(user);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response ) => {
  try {
    const { email, password, phone_no } = req.body;
    const query = email
      ? 'SELECT * FROM users WHERE email = $1'
      : 'SELECT * FROM users WHERE phone_no = $1';
    const params = [email || phone_no];
    const result = await pool.query(query, params);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new HttpError(400, 'Invalid email, phone number, or password combination');
    }
    const token = generateToken(user.id);
    user.token = token;
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const signout = async (req: Request, res: Response ) => {
  try {
    const authToken = req.cookies.auth_token;
    if (!authToken) {
      throw new HttpError(400, 'Invalid request');
    }
    res.clearCookie('auth_token');
    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const query = 'SELECT * FROM users';
    const result = await pool.query(query);
    const users = result.rows;
    if (!users) {
      throw new HttpError(400, 'No users found');
    }
    return res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    const user = result.rows[0];
    if (!user) {
      throw new HttpError(400, 'User not found');
    }
    return res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone_no } = req.body;
    const query =
      'UPDATE users SET first_name = $1, last_name = $2, email = $3, phone_no = $4 WHERE id = $5 RETURNING *';
    const result = await pool.query(query, [first_name, last_name, email, phone_no, id]);
    const updatedUser = result.rows[0];
    if (!updatedUser) {
      throw new HttpError(400, 'User not found');
    }
    return res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);

    if (result.rowCount != null && result.rowCount > 0) {
      return res.status(204).json({ message: 'User deleted' });
    } else {
      throw new HttpError(400, 'User not found');
    }
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
