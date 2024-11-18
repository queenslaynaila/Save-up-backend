import { NextFunction, Request, Response } from 'express';
import Router, { generateOpenApiSpec } from './router';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import morgan from 'morgan';
import { HttpError } from './middleware/errorMiddleware';
import './routes/categories/index';
import './routes/securityQuestions/index';
import './routes/users/index';
import './routes/withdrawals/index';
import './routes/userCumulatives/index';
import './routes/transfers/index';
import './routes/securityAnswer/index';
import './routes/savings/index';
import './routes/ratifications/index';
import './routes/pockets/index';
import './routes/pin/index';
import './routes/nextOfKin/index';
import './routes/loans/index';
import './routes/loanGuarantees/index';
import './routes/loanApprovals/index';
import './routes/invitations/index';
import './routes/groupWithdrawal/index';
import './routes/groupTransactions/index';
import './routes/groups/index';
import './routes/groupDeposits/index';
import './routes/groupDebitApprovals/index';
import './routes/externalSaving/index';
import './routes/expenses/index';
import './routes/elections/index';
import './routes/candidates/index';
import './routes/ballots/index';

const app = Router.getInstance('/').app;

app.use((_, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  next();
});
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
    exposedHeaders: ['authorization-token']
  })
);

morgan.token('error', (req: Request, res: Response) => {
  return res.locals.errorMessage || '';
});
const errorFormat = ':method :url :status :response-time ms - :res[content-length] - error: :error';

app.use((req, res, next) => {
  const logFormat = res.statusCode < 400 ? 'dev' : errorFormat;
  morgan(logFormat)(req, res, next);
});

const openApiSpec = generateOpenApiSpec();
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use(() => {
  throw new HttpError(404);
});

/* eslint-disable @typescript-eslint/no-unused-vars */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.locals.errorMessage = error;
  console.error(error);
  if (error instanceof HttpError) {
    return res.status(error.status).json({
      errors: error.errors
    });
  }
  return res.sendStatus(500);
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});