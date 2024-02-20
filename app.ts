import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import morgan from 'morgan';
import cors from 'cors';
import { HttpError } from './middleware/errorMiddleware';
import usersRoutes from './routes/users/index';
import savingsRoutes from './routes/savings/index';
import expensesRoutes from './routes/expenses/index';
import contributionsRoutes from './routes/contributions/index';
import passwordRoutes from './routes/password/index';
const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

// Routes
app.use(usersRoutes);
app.use(savingsRoutes);
app.use(expensesRoutes);
app.use(contributionsRoutes);
app.use(passwordRoutes);

// 404 handler
app.use(() => {
  throw new HttpError(404, 'Not found');
});

// Global error handler
/* eslint-disable @typescript-eslint/no-unused-vars */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(error);
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  return res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
