import express, { Express, NextFunction, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import basicAuth from 'express-basic-auth';
import cors from 'cors';
import Router, { generateOpenApiSpec } from './router';
import HttpError from '../httpError';
import logger from '../logger';
import Config from '../config';

type SwaggerConfig = {
  title: string;
  description: string;
  path: string;
  password: string;
  version?: string;
};

export interface ApplicationOptions {
  swagger: SwaggerConfig;
  setup?: (app: Express) => void;
}

export class Application extends Router {
  private readonly expressApp: Express;

  private readonly swaggerConfig: SwaggerConfig;

  private readonly registeredRouters: Router[] = [];

  constructor(options: ApplicationOptions) {
    super('');

    this.expressApp = express();
    this.swaggerConfig = options.swagger;

    this.configureApp();

    if (options.setup) {
      options.setup(this.expressApp);
    }
  }

  private configureApp(): void {
    this.expressApp.use(
      cors({
        origin: [
          'http://localhost:5173',
          'https://save-up-seven.vercel.app',
          'http://localhost:3003'
        ],
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

  public listen(port?: number, callback?: () => void): void {
    const listenPort = port || Config.PORT;

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

    this.expressApp.listen(listenPort, callback || (() => {
      logger.info(`Server running on port ${listenPort}`);
    }));
  }

  private build(): void {
    this.expressApp.use('/', this.getRouter());

    this.registeredRouters.forEach(router => {
      this.expressApp.use(router.getPrefix(), router.getRouter());
    });

    this.setupSwagger(this.swaggerConfig);
  }

  private setupSwagger(config: SwaggerConfig): void {
    const document = generateOpenApiSpec({
      title: config.title,
      description: config.description,
      version: config.version || '1.0.0'
    });

    const basePath = config.path.replace(/\/$/, '');

    this.expressApp.use(
      [basePath, `${basePath}-json`],
      basicAuth({
        challenge: true,
        users: { admin: config.password }
      })
    );

    this.expressApp.use(basePath, swaggerUi.serve, swaggerUi.setup(document));
  }

  public getExpressApp(): Express {
    return this.expressApp;
  }
}