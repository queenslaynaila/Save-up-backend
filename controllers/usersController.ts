import { Request, Response } from 'express';
import pool from '../db';
import bcrypt from 'bcrypt';
import { userSchema, HttpError, userLoginSchema, idSchema, updateUserSchema } from '../types';
import { generateToken } from '../middleware/generatetoken';


export const createUser = async (req: Request, res: Response) => {
  const validationResult = userSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new HttpError(422, 'Invalid phone number or password');
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
    const newUser = userResult.rows[0];

    const userDataToSend = {
      id: newUser.id,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      phone_no: newUser.phone_no,
      created_at: newUser.created_at,
      updated_at: newUser.updated_at,
      total_targeted_amount: newUser.total_targeted_amount,
      total_contributions_amount: newUser.total_contributions_amount,
      total_expenses_amount: newUser.total_expenses_amount
    };
    const token = generateToken(newUser.id);
    res.cookie('token', token, { httpOnly: true, secure: true }).json(userDataToSend);
  } catch (error) {
    throw new HttpError(400, 'An account with the provided email or phone number already exists');
  }
};

export const login = async (req: Request, res: Response) => {
  const validationResult = userLoginSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new HttpError(422, 'Invalid phone number or password');
  }
  const { password, phone_no } = req.body;
  const params = [phone_no];
  const query = 'SELECT * FROM users WHERE phone_no = $1';

  const result = await pool.query(query, params);
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new HttpError(400, 'Invalid email, phone number, or password combination');
  }

  const token = generateToken(user.id);
  res.cookie('token', token, { httpOnly: true, secure: true }).json(user);
};

export const signout = async (req: Request, res: Response) => {
  const authToken = req.cookies.auth_token;
  if (!authToken) {
    throw new HttpError(400, 'Invalid request: no auth token provided');
  }
  res.clearCookie('auth_token');
  return res.status(200).json({ message: 'Logout successful' });
};

export const getAllUsers = async (req: Request, res: Response) => {
  const query = 'SELECT * FROM users';
  const result = await pool.query(query);
  const users = result.rows;
  if (!users ) {
    throw new HttpError(400, 'No users found');
  }
  res.status(200).json(users);
};

export const getUserById = async (req: Request, res: Response) => {
  const validationResult = idSchema.safeParse(req.params.id);
  if (!validationResult.success) {
    throw new HttpError(422, 'Invalid user ID');
  }
  const loggedInUser = req.user?.id
  const id = validationResult.data;
  if (loggedInUser !== id) {
    throw new HttpError(401, 'Unauthorized access ');
  }
  const query = 'SELECT * FROM users WHERE id = $1';
  const result = await pool.query(query, [id,loggedInUser]);
  const user = result.rows[0];
  if (!user) {
    throw new HttpError(404, 'User with submitted ID not found');
  }
  res.status(200).json(user);
};


export const updateUser = async (req: Request, res: Response) => {
  const validationResult = idSchema.safeParse(req.params.id);
  if (!validationResult.success) {
    throw new HttpError(422, 'Invalid user ID');
  }
  const userId = validationResult.data;
  if (userId !== req.user?.id) {
    throw new HttpError(401, 'Unauthorized access ');
  }
  const validationResultBody = updateUserSchema.safeParse(req.body);

  if (!validationResultBody.success) {
    throw new HttpError(
      422,
      'Invalid user data. Please provide valid values for all user fields.'
    );
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
    throw new HttpError(400, 'User with given ID not found');
  }

  res.status(200).json(updatedUser);
};



export const deleteUser = async (req: Request, res: Response) => {
  const validationResult = idSchema.safeParse(req.params.id);
 

  if (!validationResult.success) {
    throw new HttpError(422, 'Invalid user ID');
  }
  const id = validationResult.data;
  if (id !== req.user?.id) {
      throw new HttpError(401, 'Unauthorized access');
  }

  const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);

  if (result.rowCount != null && result.rowCount > 0) {
    res.status(200).json({ message: 'User deleted successfully' });
  } else {
    throw new HttpError(400, 'User with provided ID not found');
  }
};
