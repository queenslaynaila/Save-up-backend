import 'express-async-errors';
import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { HttpError } from './middleware/errorMiddleware';
import usersRoutes from './routes/users/index';
import categoriesRoutes from './routes/categories/index';
import savingsRoutes from './routes/savings/index';
import expensesRoutes from './routes/expenses/index';
import contributionsRoutes from './routes/contributions/index';
import AdminRoutes from './routes/admin/index';
import passwordRoutes from './routes/password/index';
import securityQuestionsRoutes from './routes/securityQuestions';
import securityAnswerRoutes from './routes/securityAnswer/index';
import cumulativesRoutes from './routes/cumulatives/index';
const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan('dev'));
app.use(
  cors({
    exposedHeaders: ['Authorization', 'X-Auth-Token'],
  })
);

// Routes
usersRoutes(app);
savingsRoutes(app);
expensesRoutes(app);
contributionsRoutes(app);
passwordRoutes(app);
categoriesRoutes(app);
AdminRoutes(app);
securityQuestionsRoutes(app);
securityAnswerRoutes(app);
cumulativesRoutes(app);

// 404 handler
app.use(() => {
  throw new HttpError(404, 'Route Not found');
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
