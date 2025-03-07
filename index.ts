import 'express-async-errors';
import { NextFunction, Request, Response } from 'express';
import Router, { generateOpenApiSpec } from './router';
import swaggerUi from 'swagger-ui-express';
import HttpError from './httpError';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import logger from './logger';
import './routes/categories/index';
import './routes/auth/index';
import './routes/users/index';
import './routes/nextOfKin/index';
import './routes/expenses/index';
import './routes/pockets/index';
import './routes/transactions/index';
import './routes/groups/index';
import './routes/elections/index';
import './routes/groupWithdrawal/index';
import './routes/groupDebitApprovals/index';
import './routes/loans/index';
import './routes/loanGuarantees/index';
import './routes/loanApprovals/index';
import './routes/donations/index';
import './routes/securityQuestions/index';
import Config from './config';

extendZodWithOpenApi(z);

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

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(`error is ${(error)}`);
  if (error instanceof HttpError) {
    return res.status(error.status).json(error);
  }
  return res.sendStatus(500);
});

app.listen(Config.PORT, () => {
  logger.info(`Server running on port ${Config.PORT}`);
});