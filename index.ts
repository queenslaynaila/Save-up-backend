import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import morgan from 'morgan';
import cors from 'cors';
import { HttpError } from './middleware/errorMiddleware';
import cron from 'node-cron';
import remindStaleGoals from './cronJobs/overdueGoalsReminder';
import creditInterest from './cronJobs/creditInterest';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import getAllCategories from './routes/categories';
import { registry } from './router';

dotenv.config();

cron.schedule('0 10 */14 * *', remindStaleGoals);
cron.schedule('0 2 */7 * *', creditInterest);

const app = express();

app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(express.json());
app.use((_, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  next();
});
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
    exposedHeaders: ['authorization-token', 'reset-token']
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

app.use(getAllCategories);

const generateOpenApiSpec = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'API Documentation for Saveup',
      version: '1.0.0',
      description: 'This is the API documentation for Saveup. Saveup is a platform that helps users manage their savings and financial goals. The API provides endpoints for managing users, categories, pockets, and next of kin information.'
    }
  });
};

const openApiSpec = generateOpenApiSpec();
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use(() => {
  throw new HttpError(404);
});

/* eslint-disable @typescript-eslint/no-unused-vars */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.locals.errorMessage = error;
  if (error instanceof HttpError) {
    return res.status(error.status).json({
      errors: error.errors
    });
  }
  return res.sendStatus(500);
});

const port: number = parseInt(process.env.PORT as string, 10);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`app listening on port ${port}`);
});