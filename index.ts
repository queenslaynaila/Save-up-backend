import 'express-async-errors';
import { NextFunction, Request, Response } from 'express';
import Router, { generateOpenApiSpec } from './router';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import morgan from 'morgan';
import HttpError from './httpError';
import dotenv from 'dotenv';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import logger from './logger';
import './routes/auth/index';
import './routes/users/index';
import './routes/nextOfKin/index';
import './routes/securityQuestions/index';
import './routes/pin/index';
import './routes/categories/index';
import './routes/expenses/index';
import './routes/pockets/index';
import './routes/savings/index';
import './routes/transactions/index';
import './routes/groups/index';
import './routes/invitations/index';
import './routes/elections/index';
import './routes/candidates/index';
import './routes/ballots/index';
import './routes/ratifications/index';
import './routes/groupWithdrawal/index';
import './routes/groupTransactions/index';
import './routes/groupDeposits/index';
import './routes/groupDebitApprovals/index';
import './routes/externalSaving/index';
import './routes/loans/index';
import './routes/loanGuarantees/index';
import './routes/loanApprovals/index';
import './routes/admin/index';

extendZodWithOpenApi(z);

dotenv.config();

const app = Router.getAppInstance();

const openApiSpec = generateOpenApiSpec();
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
const morganFormat = 'combined';

const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

app.use(morgan(morganFormat, { stream: morganStream }));

app.use((_, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  next();
});
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
    exposedHeaders: ['Authorization', 'Reset']
  })
);

app.use(() => {
  throw new HttpError(404);
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`global error handler and errors looks like: ${JSON.stringify(error)}`);
  if (error instanceof HttpError) {
    logger.info(`http handler and errors looks like: ${JSON.stringify(error.errors)}`);
    return res.status(error.status).json(error);
  }

  return res.sendStatus(500);
});

const port: number = parseInt(process.env.PORT as string, 10);
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});