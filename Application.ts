import express, {
  Application as ExpressApplication,
  NextFunction,
  Request,
  Response,
  Router as ExpressRouter
} from 'express';
import {
  extendZodWithOpenApi,
  OpenApiGeneratorV3,
  OpenAPIRegistry
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { isNestedRouter, Router } from './Router';
import { InfoObject } from 'openapi3-ts/dist/model/openapi30';
import authMiddleware from './middleware/authorization';

extendZodWithOpenApi(z);

function joinPaths(a: string, b: string) {
  return [a, b]
    .map(x => x.trim())
    .join('/')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '');
}

type ApplicationOptions = {
  info: InfoObject,
  basePath?: string;
  setup?: (app: ExpressApplication) => void
  onError?: (error: Error, req: Request, res: Response) => void;
}

export class Application extends Router {
  private readonly app: ExpressApplication;

  private readonly openApiInfo: InfoObject;

  private readonly basePath: string;

  constructor(options: ApplicationOptions) {
    super();
    this.app = express();

    this.app.use(
      cors({
        origin: true,
        credentials: true,
        exposedHeaders: ['X-Requested-With', 'X-HTTP-Method-Override', 'Content-Type', 'Accept', 'Set-Cookie']
      })
    );

    const {
      setup,
      onError,
      basePath,
      info
    } = options;
    this.openApiInfo = info;
    this.basePath = basePath || '';

    if (setup) {
      setup(this.app);
    }

    if (onError) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      this.app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
        onError(error, req, res);
      });
    }
  }

  listen(port: number, callback?: () => void) {
    this.build();
    this.app.listen(port, callback);
  }

  private build() {
    const registry = new OpenAPIRegistry();

    type BuildOptions = {
      tag: string;
      path: string;
      router: Router;
    };

    function buildRouter(options: BuildOptions): ExpressRouter {
      const apiTag = options.tag;
      const routePrefix = options.path;
      const router = ExpressRouter({ mergeParams: true });

      options.router.specs.forEach(child => {
        if (isNestedRouter(child)) {
          router.use(child.path, buildRouter({
            tag: child.tag || apiTag,
            path: joinPaths(routePrefix, child.path),
            router: child.router
          }));
          return;
        }

        const {
          hidden,
          method,
          path,
          summary,
          description,
          auth,
          schema,
          response,
          middlewares = [],
          handler
        } = child;

        // Add validation middlewares at the beginning
        if (schema) {
          const inputs = ['params', 'query', 'body'] as const;
          inputs.forEach(input => {
            if (!schema[input]) return;

            middlewares.unshift((req, res, next) => {
              const {
                success,
                error
              } = schema[input].safeParse(req[input]);
              if (success) {
                return next();
              }

              const err = error.errors[0];
              throw new Error(JSON.stringify({
                message: err.message || 'Request validation failed',
                path: [input, err.path].join('.')
              }));
            });
          });
        }

        if (auth) {
          // Auth middleware is always the last middleware
          const authOptions = auth === true ? {} : auth;
          middlewares.push(authMiddleware(authOptions));
        }

        router[method](path, ...middlewares, handler);

        if (hidden) return;
        registry.registerPath({
          tags: apiTag ? [apiTag] : undefined,
          method: method,
          path: joinPaths(routePrefix, path),
          summary: summary,
          description: description,
          security: auth ? [{ Authorization: [] }] : undefined,
          request: {
            params: schema?.params,
            query: schema?.query,
            body: schema?.body ? {
              content: {
                'application/json': {
                  schema: schema.body
                }
              }
            } : undefined
          },
          responses: {
            [response?.statusCode ?? 200]: {
              description: response?.description || 'Success',
              content: response?.schema ? {
                'application/json': {
                  schema: response?.schema
                }
              } : undefined
            }
          }
        });
      });

      return router;
    }

    this.app.use(this.basePath, buildRouter({
      tag: '',
      path: this.basePath,
      router: this
    }));

    registry.registerComponent(
      'securitySchemes',
      'Authorization',
      {
        type: 'http',
        name: 'Authorization',
        scheme: 'Bearer',
        description: 'JWT Token'
      }
    );

    const generator = new OpenApiGeneratorV3(registry.definitions);
    const openApiSpec = generator.generateDocument({
      openapi: '3.0.0',
      info: this.openApiInfo
    });

    this.app.use(
      joinPaths(this.basePath, '/docs'),
      swaggerUi.serve,
      swaggerUi.setup(openApiSpec)
    );
  }
}
