import express, {
  Router as ExpressRouter,
  Request,
  Response,
  NextFunction,
  Application,
  RequestHandler
} from 'express';
import { AnyZodObject, TypeOf, z, ZodNever, ZodSchema, ZodUndefined } from 'zod';
import { extendZodWithOpenApi, OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import fastJson from 'fast-json-stringify';
import zodToJsonSchema from 'zod-to-json-schema';
import Ajv, { ErrorObject } from 'ajv';
import basicAuth from 'express-basic-auth';
import cors from 'cors';
import HttpError from './httpError';
import Config from './config';
import { authMiddleware } from './utils';
import { Role } from './routes/users/schema';
import rateLimit from 'express-rate-limit';
import addFormats from 'ajv-formats';

const ajv = new Ajv({
  coerceTypes: true,
  useDefaults: true
});

addFormats(ajv, {
  mode: 'fast',
  formats: ['date-time', 'date']
});

const swaggerConfig = {
  username: Config.SWAGGER_USERNAME,
  password: Config.SWAGGER_PASSWORD
};

const validateSchema = (schema: ZodSchema, data: unknown, section: 'body' | 'query' | 'params') => {
  const jsonSchema = zodToJsonSchema(schema, { target: 'openApi3' });
  const validate = ajv.compile(jsonSchema);
  const valid = validate(data);

  if (!valid) {
    const errors = validate.errors?.map((err: ErrorObject) => ({
      section,
      message: err.message,
      params: err.params,
      keyword: err.keyword,
      dataPath: err.instancePath,
      schemaPath: err.schemaPath
    }));
    throw new HttpError(400, errors);
  }
};

const validateRequest = (schema: {
  body?: ZodSchema;
  query?: AnyZodObject;
  params?: AnyZodObject;
}) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (schema.body) validateSchema(schema.body, req.body, 'body');
    if (schema.query) validateSchema(schema.query, req.query, 'query');
    if (schema.params) validateSchema(schema.params, req.params, 'params');
    next();
  };
};

type HttpMethod = 'get' | 'post' | 'patch' | 'delete' | 'put';
const emptyObjectSchema = z.object({}).strict();
extendZodWithOpenApi(z);

interface RouteOptions<
  Params extends AnyZodObject | typeof emptyObjectSchema = typeof emptyObjectSchema,
  ResBody = ZodSchema | ZodNever,
  ReqBody = ZodSchema | ZodNever,
  Query extends AnyZodObject | typeof emptyObjectSchema = typeof emptyObjectSchema
> {
  path: string;
  hidden?: boolean;
  summary?: string;
  description?: string;
  schema?: {
    params?: Params;
    body?: ZodSchema<ReqBody>;
    query?: Query;
  };
  response?: {
    statusCode?: number;
    schema?: ZodSchema<ResBody> | ZodUndefined;
    description?: string;
  };
  auth?: true | Role | Role[];
  rateLimit?: {
    limit: number;
    windowMs: number;
    message?: string;
    skipForAdmins?: boolean;
  };
  middlewares?: RequestHandler[];
  handler: RequestHandler<TypeOf<Params>, ResBody, ReqBody, TypeOf<Query>>;
}

type SpecificRouteMethodHandler = <
  Params extends AnyZodObject | typeof emptyObjectSchema = typeof emptyObjectSchema,
  ResBody = ZodSchema | ZodNever,
  ReqBody = ZodSchema | ZodNever,
  Query extends AnyZodObject | typeof emptyObjectSchema = typeof emptyObjectSchema
>(options: RouteOptions<Params, ResBody, ReqBody, Query>) => void;

const registry = new OpenAPIRegistry();

class Router {
  private static app: Application = express();

  // eslint-disable-next-line no-use-before-define
  private static routerInstances: Map<string, Router> = new Map();

  public readonly get: SpecificRouteMethodHandler;

  public readonly post: SpecificRouteMethodHandler;

  public readonly put: SpecificRouteMethodHandler;

  public readonly patch: SpecificRouteMethodHandler;

  public readonly delete: SpecificRouteMethodHandler;

  private readonly router: ExpressRouter;

  private readonly routePrefix: string;

  private readonly apiTag?: string;

  private constructor(routePrefix: string, apiTag?: string) {
    this.router = ExpressRouter();
    this.routePrefix = `/saveup${routePrefix}`;
    this.apiTag = apiTag;

    this.get = this.createMethodHandler('get');
    this.post = this.createMethodHandler('post');
    this.put = this.createMethodHandler('put');
    this.patch = this.createMethodHandler('patch');
    this.delete = this.createMethodHandler('delete');

    Router.app.use(this.routePrefix, this.router);
  }

  private createMethodHandler(method: HttpMethod): SpecificRouteMethodHandler {
    return <
      Params extends AnyZodObject | typeof emptyObjectSchema, ResBody,
      ReqBody,
      Query extends AnyZodObject | typeof emptyObjectSchema
    >(options: RouteOptions<Params, ResBody, ReqBody, Query>) => {
      const {
        path,
        schema,
        auth,
        middlewares = [],
        handler,
        response: resOpt
      } = options;

      const response = {
        statusCode: resOpt?.statusCode ?? (resOpt?.schema ? 200 : 204),
        schema: resOpt?.schema ?? z.never()
      };
      const responseDescription = response.statusCode.toString().startsWith('2')
        ? 'Success'
        : 'Error';

      const processedMiddlewares = [...middlewares];
      if (schema) processedMiddlewares.unshift(validateRequest(schema));
      if (auth) processedMiddlewares.push(authMiddleware(auth));

      if (options.rateLimit) {
        const { limit, windowMs, message, skipForAdmins } = options.rateLimit;
        const rateLimitOptions = {
          windowMs,
          max: limit,
          message: message || 'Too many requests',
          skip: (req: Request) => Boolean(skipForAdmins && req.user?.role === 'Admin')
        };
        processedMiddlewares.push(rateLimit(rateLimitOptions));
      }

      const security = [];
      if (auth) security.push({ Authorization: [] });
      if (processedMiddlewares.some(m => m.name === 'resetStepValidator')) {
        security.push({ Reset: [] });
      }

      const responseSchemas = {
        [response.statusCode]: {
          description: responseDescription,
          content: {
            'application/json': {
              schema: zodToJsonSchema(response.schema, { target: 'openApi3' })
            }
          }
        }
      };

      const transformedPath = path.replace(/:([^/]+)/g, '{$1}');
      const fullPath = `${this.routePrefix}${transformedPath}`
        .replace(/\/+/g, '/')
        .replace(/\/$/, '');

      if (!options.hidden) {
        registry.registerPath({
          tags: this.apiTag ? [this.apiTag] : undefined,
          method,
          path: fullPath,
          summary: options.summary,
          description: options.description,
          security,
          request: {
            params: schema?.params,
            body: schema?.body ? {
              description: schema.body.description,
              content: {
                'application/json': {
                  schema: schema.body
                }
              }
            } : undefined,
            query: schema?.query
          },
          responses: responseSchemas
        });
      }

      if (response.schema) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const jsonResponseSchema: any = zodToJsonSchema(response.schema, { target: 'openApi3' });
        const stringify = fastJson(jsonResponseSchema);

        const errorSchema = z.union([
          z.record(z.unknown()),
          z.array(z.record(z.unknown()))
        ]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const jsonErrorSchema: any = zodToJsonSchema(errorSchema, { target: 'openApi3' });
        const errStringify = fastJson(jsonErrorSchema);

        processedMiddlewares.push((_req: Request, res: Response, next: NextFunction) => {
          res.json = <T extends object>(data: T) => {
            res.setHeader('Content-Type', 'application/json');
            if (data instanceof HttpError) {
              return res.send(errStringify(data.errors));
            }
            return res.send(stringify(data));
          };
          next();
        });
      }

      this.router[method](path, ...processedMiddlewares, handler as RequestHandler);
    };
  }

  public static initialize() {
    Router.app.use(
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
    Router.app.use(express.json());
    Router.app.use(
      ['/saveup/docs'],
      basicAuth({
        challenge: true,
        users: {
          [swaggerConfig.username]: swaggerConfig.password
        }
      })
    );
  }

  public static getAppInstance(): Application {
    return Router.app;
  }

  public static getRouterInstance(routePrefix: string, apiTag?: string): Router {
    const key = `${routePrefix}::${apiTag}`;

    if (!Router.routerInstances.has(key)) {
      Router.routerInstances.set(key, new Router(routePrefix, apiTag));
    }

    return Router.routerInstances.get(key)!;
  }
}

Router.initialize();

registry.registerComponent(
  'securitySchemes',
  'Authorization',
  {
    type: 'apiKey',
    name: 'Authorization',
    in: 'header',
    description: 'JWT Bearer token used for user authentication.\n\n'
      + 'The token must be included in the "Authorization" header as:\n\n'
      + 'Bearer <token> for secure access to protected routes.'
  }
);

registry.registerComponent(
  'securitySchemes',
  'Reset',
  {
    type: 'apiKey',
    name: 'Reset',
    in: 'header',
    description: 'JWT token used to manage the multi-step password reset process.\n\n'
      + 'The token is generated at each step, and its payload indicates the user\'s current step.\n\n'
      + 'It ensures the user cannot skip steps and is required for every request in the reset process.'
  }
);

export const generateOpenApiSpec = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'API Documentation for Saveup',
      version: '1.0.0',
      'x-logo': {
        url: './signin_tree.jpeg'
      }
    },
    security: [
      {
        Authorization: []
      }
    ]
  });
};

export default Router;