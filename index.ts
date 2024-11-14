import express, { NextFunction, Request, Response } from 'express';
import { generateOpenApiSpec } from './router';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import morgan from 'morgan';
import categoryRoutes from './routes/categories/index';
import { HttpError } from './middleware/errorMiddleware';
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

app.use('/categories', categoryRoutes.getRouter());

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

// Start Express server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});