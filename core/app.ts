import express, { Express, NextFunction, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import basicAuth from 'express-basic-auth';
import cors from 'cors';
import Router from './router';
import HttpError from '../httpError';
import logger from '../logger';
import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';

type SwaggerConfig = {
  title: string;
  description: string;
  path: string;
  password: string;
  version?: string;
};

interface JobConfig {
  name: string;
  setup: () => Promise<void>;
}

interface ApplicationOptions {
  swagger: SwaggerConfig;
  jobs?: JobConfig[];
  allowedOrigins: string[];
}

export class Application {
  private readonly expressApp: Express;

  private readonly swaggerConfig: SwaggerConfig;

  private readonly allowedOrigins: string[] = [];

  private readonly registeredRouters: Router[] = [];

  private readonly jobs: JobConfig[] = [];

  constructor(options: ApplicationOptions) {
    this.expressApp = express();
    this.swaggerConfig = options.swagger;
    this.allowedOrigins = options.allowedOrigins;

    this.configureApp();

    if (options.jobs) {
      this.jobs.push(...options.jobs);
      this.setupJobs();
    }
  }

  private configureApp(): void {
    this.expressApp.use(
      cors({
        origin: [...this.allowedOrigins],
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS', 'PUT'],
        credentials: true,
        exposedHeaders: ['Authorization', 'Reset'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Reset']
      })
    );

    this.expressApp.use(express.json());

    this.expressApp.use((req: Request, res: Response, next: NextFunction): void => {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      next();
    });
  }

  public use(router: Router): void {
    this.registeredRouters.push(router);
  }

  public listen(PORT: number, callback: () => void): void {
    this.build();

    this.expressApp.use((_req: Request, _res: Response, _next: NextFunction): void => {
      throw new HttpError(404);
    });

    this.expressApp.use((error: Error, _req: Request, res: Response, _next: NextFunction): void => {
      if (error instanceof HttpError) {
        res.status(error.status).json(error);
      } else {
        logger.error(`Unhandled error: ${error.message}`);
        res.sendStatus(500);
      }
    });

    this.expressApp.listen(PORT, callback);
  }

  private build(): void {
    this.registeredRouters.forEach(router => {
      this.expressApp.use(router.getPrefix(), router.getRouter());
    });

    this.setupSwagger(this.swaggerConfig);
  }

  private setupSwagger(config: SwaggerConfig): void {
    const generator = new OpenApiGeneratorV3(Router.getRegistry().definitions);
    const document = generator.generateDocument({
      openapi: '3.0.0',
      info: {
        title: config.title,
        version: config.version || '1.0.0',
        description: config.description
      },
      security: [
        {
          Authorization: []
        }
      ]
    });

    const basePath = config.path.replace(/\/$/, '');

    this.expressApp.use(
      basePath,
      basicAuth({
        challenge: true,
        users: { admin: config.password }
      })
    );

    this.expressApp.use(basePath, swaggerUi.serve, swaggerUi.setup(document));
  }

  private async setupJobs(): Promise<void> {
    await Promise.all(
      this.jobs.map(async (job) => {
        try {
          await job.setup();
          logger.info(`Job ${job.name} setup successfully`);
        } catch (error) {
          logger.error(`Failed to setup ${job.name}: ${error}`);
          throw error;
        }
      })
    );

    logger.info('Job setup complete');
  }

  public getExpressApp(): Express {
    return this.expressApp;
  }
}