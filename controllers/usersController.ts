import { Request, Response } from 'express';
import pool from '../db';
import jwt, { Secret } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { userSchema, HttpError, userLoginSchema, idSchema, updateUserSchema } from '../types';

const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as Secret, { expiresIn: '1h' });
};

export const createUser = async (req: Request, res: Response) => {
  const validationResult = userSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res
      .status(400)
      .json({ error: new HttpError(400, 'Invalid email, phone number, or password').message });
  }
  const { first_name, last_name, phone_no, password } = validationResult.data;
  const password_hash = bcrypt.hashSync(password, 10);
  const userQuery = `
    INSERT INTO users (first_name, last_name, phone_no, password_hash, created_at, updated_at) 
    VALUES ($1, $2, $3, $4, NOW(), NOW())
    RETURNING *`;
  const userValues = [first_name, last_name, phone_no, password_hash];
  try {
    const userResult = await pool.query(userQuery, userValues);
    const user = userResult.rows[0];
    const token = generateToken(user.id);
    user.token = token;
    return res.json(user);
  } catch (error) {
    return res.status(400).json({
      error: new HttpError(400, 'An account with the provided email or phone number already exists')
        .message,
    });
  }
};
export const login = async (req: Request, res: Response) => {
  const validationResult = userLoginSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res
      .status(400)
      .json({ error: new HttpError(400, 'Invalid email, phone number, or password').message });
  }
  const { email, password, phone_no } = req.body;
  const params = [email || phone_no];
  const query = email
    ? 'SELECT * FROM users WHERE email = $1'
    : 'SELECT * FROM users WHERE phone_no = $1';

  const result = await pool.query(query, params);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(400).json({
      error: new HttpError(400, 'Invalid email, phone number, or password combination').message,
    });
  }

  const token = generateToken(user.id);
  user.token = token;
  res.json(user);
};

export const signout = async (req: Request, res: Response) => {
  const authToken = req.cookies.auth_token;
  if (!authToken) {
    return res
      .status(400)
      .json({ error: new HttpError(400, 'Invalid request: no auth token provided').message });
  }
  res.clearCookie('auth_token');
  return res.status(200).json({ message: 'Logout successful' });
};

export const getAllUsers = async (req: Request, res: Response) => {
  const query = 'SELECT * FROM users';
  const result = await pool.query(query);
  const users = result.rows;
  if (!users || users.length === 0) {
    return res.status(404).json({ error: new HttpError(404, 'No users found').message });
  }
  return res.status(200).json(users);
};

export const getUserById = async (req: Request, res: Response) => {
  const validationResult = idSchema.safeParse(req.params.id);
  if (!validationResult.success) {
    return res.status(400).json({ error: new HttpError(400, 'Invalid user ID').message });
  }
  const id = validationResult.data;
  const query = 'SELECT * FROM users WHERE id = $1';
  const result = await pool.query(query, [id]);
  const user = result.rows[0];
  if (!user) {
    return res
      .status(400)
      .json({ error: new HttpError(400, 'User with submitted ID not found').message });
  }
  return res.status(200).json(user);
};

export const updateUser = async (req: Request, res: Response) => {
  const validationResult = idSchema.safeParse(req.params.id);
  if (!validationResult.success) {
    return res.status(400).json({ error: new HttpError(400, 'Invalid user ID').message });
  }
  const userId = validationResult.data;
  if (userId !== req.user?.id) {
    return res
      .status(403)
      .json({ error: 'You are not authorized to update this user information' });
  }
  const validationResultBody = updateUserSchema.safeParse(req.body);

  if (!validationResultBody.success) {
    return res.status(400).json({
      error: new HttpError(
        400,
        'Invalid user data. Please provide valid values for all user fields.'
      ).message,
    });
  }

  const { first_name, last_name, email, phone_no } = validationResultBody.data;
  let query = 'UPDATE users SET ';
  const values = [];

  if (first_name) {
    query += `first_name = $${values.length + 1}, `;
    values.push(first_name);
  }
  if (last_name) {
    query += `last_name = $${values.length + 1}, `;
    values.push(last_name);
  }
  if (email) {
    query += `email = $${values.length + 1}, `;
    values.push(email);
  }
  if (phone_no) {
    query += `phone_no = $${values.length + 1}, `;
    values.push(phone_no);
  }

  query = query.slice(0, -2);

  query += ` WHERE id = $${values.length + 1} RETURNING *`;
  values.push(userId);

  const result = await pool.query(query, values);
  const updatedUser = result.rows[0];

  if (!updatedUser) {
    return res
      .status(400)
      .json({ error: new HttpError(400, 'User with given ID not found').message });
  }

  return res.status(200).json(updatedUser);
};

export const deleteUser = async (req: Request, res: Response) => {
  const validationResult = idSchema.safeParse(req.params.id);
  if (!validationResult.success) {
    return res.status(400).json({ error: new HttpError(400, 'Invalid user ID').message });
  }
  const id = validationResult.data;
  if (id !== req.user?.id) {
    return res
      .status(403)
      .json({ error: 'You are not authorized to delete this user information' });
  }

  const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);

  if (result.rowCount != null && result.rowCount > 0) {
     return res.status(204).json({ message: 'User deleted successfully' });
  } else {
    return res
      .status(400)
      .json({ error: new HttpError(400, 'User with provided ID not found').message });
  }
};
