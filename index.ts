import 'express-async-errors';
import { NextFunction, Request, Response } from 'express';
import Router, { generateOpenApiSpec } from './router';
import swaggerUi from 'swagger-ui-express';
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
import './routes/transactions/index';
import './routes/invitations/index';
import './routes/groups/index';
import './routes/elections/index';
import './routes/groupWithdrawal/index';
import './routes/groupDeposits/index';
import './routes/groupDebitApprovals/index';
import './routes/loans/index';
import './routes/loanGuarantees/index';
import './routes/loanApprovals/index';
import './routes/donations/index';
import Config from './config';

extendZodWithOpenApi(z);

dotenv.config();

const app = Router.getAppInstance();

const openApiSpec = generateOpenApiSpec();
app.use('/saveup/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use((_, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  next();
});

app.use(() => {
  throw new HttpError(404);
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(error);
  if (error instanceof HttpError) {
    return res.status(error.status).json(error);
  }

  return res.sendStatus(500);
});

app.listen(Config.PORT, () => {
  logger.info(`Server running on port ${Config.PORT}`);
});