/* eslint-disable @typescript-eslint/no-unused-vars */
import 'express-async-errors';
import { NextFunction, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import Router, { generateOpenApiSpec } from './router';
import HttpError from './httpError';
import logger from './logger';
import Config from './config';
import path from 'path';
import './generatePresignedUrl';
import './routes/securityQuestions/index';
import './routes/categories/index';
import './routes/auth/index';
import './routes/users/index';
import './routes/nextOfKin/index';
import './routes/groups/index';
import './routes/elections/index';
import './routes/groupWithdrawals/index';
import './routes/loans/index';
import './routes/groupDebits/index';
import './routes/pockets/index';
import './routes/stats/index';
import './routes/expenses/index';
import './routes/donations/index';
import './routes/transactions/index';
import { setupDailyInterestSchedule, startInterestJobWorker } from './jobs/bullConfig';

extendZodWithOpenApi(z);

const app = Router.getAppInstance();

app.use('/saveup/docs', swaggerUi.serve, swaggerUi.setup(generateOpenApiSpec()));

app.use((_req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  next();
});

app.use((_req: Request, _res: Response, _next: NextFunction): void => {
  throw new HttpError(404);
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction): void => {
  if (error instanceof HttpError) {
    res.status(error.status).json(error);
  } else {
    logger.error(error.stack);
    res.sendStatus(500);
  }
});

setupDailyInterestSchedule().catch(err => {
  logger.error('Failed to schedule daily interest job:', err);
});

startInterestJobWorker();

app.listen(Config.PORT, (): void => {
  logger.info(`Server running on port ${Config.PORT}`);
});
