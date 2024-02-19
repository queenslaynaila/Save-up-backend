import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import morgan from 'morgan';
import cors from 'cors';
import usersRouter from './routes/users';
import savingsRouter from './routes/savings';
import contributionsRouter from './routes/contributions';
import expensesRouter from './routes/expenses';
import passwordRouter from './routes/resetpasswors';
import { HttpError } from './types';
const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

// Routes
app.use('/users', usersRouter);
app.use('/savings', savingsRouter);
app.use('/contributions', contributionsRouter);
app.use('/expenses', expensesRouter);
app.use('/', passwordRouter);

// 404 Error handler
app.use((req: Request, res: Response) => {
  const error = new Error('Not found');
  res.status(404).json({ error: { message: error.message } });
});

// Global error handler
/* eslint-disable @typescript-eslint/no-unused-vars */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  return res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
