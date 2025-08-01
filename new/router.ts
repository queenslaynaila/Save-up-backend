/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Router as ExpressRouter,
  Request,
  Response,
  NextFunction,
  RequestHandler
} from 'express';
import z, { AnyZodObject, TypeOf, ZodNever, ZodSchema, ZodUndefined } from 'zod';
import { Role } from '../routes/users/schema';
import zodToJsonSchema from 'zod-to-json-schema';
import { extendZodWithOpenApi, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import HttpError from '../httpError';
import Ajv, { ErrorObject } from 'ajv';
import rateLimit from 'express-rate-limit';
import addFormats from 'ajv-formats';
import { authMiddleware } from '../utils';
import fastJson from 'fast-json-stringify';

extendZodWithOpenApi(z);

const ajv = new Ajv({
  coerceTypes: true,
  useDefaults: true
});

addFormats(ajv, {
  mode: 'fast',
  formats: ['date-time', 'date']
});

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

export class Router {
  private static registry = new OpenAPIRegistry();

  static {
    Router.registry.registerComponent(
      'securitySchemes',
      'Authorization',
      {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'JWT Bearer token for authentication'
      }
    );

    Router.registry.registerComponent(
      'securitySchemes',
      'Reset',
      {
        type: 'apiKey',
        name: 'Reset',
        in: 'header',
        description: 'JWT token for password reset process'
      }
    );
  }

  protected readonly router: ExpressRouter;

  protected readonly resourceName: string;

  protected readonly routePrefix: string;

  public readonly get: SpecificRouteMethodHandler;

  public readonly post: SpecificRouteMethodHandler;

  public readonly put: SpecificRouteMethodHandler;

  public readonly patch: SpecificRouteMethodHandler;

  public readonly delete: SpecificRouteMethodHandler;

  private static routerInstances = new Map<string, Router>();

  constructor(resourceName: string) {
    this.router = ExpressRouter();
    this.resourceName = resourceName;

    this.routePrefix = `/saveup/${resourceName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')}`;

    this.get = this.createMethodHandler('get');
    this.post = this.createMethodHandler('post');
    this.put = this.createMethodHandler('put');
    this.patch = this.createMethodHandler('patch');
    this.delete = this.createMethodHandler('delete');
  }

  public getRouter(): ExpressRouter {
    return this.router;
  }

  public getPrefix(): string {
    return this.routePrefix;
  }

  public static createResourceRouter(resourceName: string): Router {
    if (!this.routerInstances.has(resourceName)) {
      this.routerInstances.set(resourceName, new Router(resourceName));
    }

    return this.routerInstances.get(resourceName)!;
  }

  protected createMethodHandler(method: HttpMethod): SpecificRouteMethodHandler {
    return <
      Params extends AnyZodObject | typeof emptyObjectSchema,
      ResBody,
      ReqBody,
      Query extends AnyZodObject | typeof emptyObjectSchema
    >(options: RouteOptions<Params, ResBody, ReqBody, Query>) => {
      const { path, schema, auth, middlewares = [], handler, response: resOpt } = options;

      const response = {
        statusCode: resOpt?.statusCode ?? (resOpt?.schema ? 200 : 204),
        schema: resOpt?.schema ?? z.never()
      };

      const processedMiddlewares = [];
      if (schema) processedMiddlewares.push(validateRequest(schema));
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

      processedMiddlewares.push(...middlewares);

      if (!options.hidden) {
        this.registerWithOpenAPI(method, path, options, response, processedMiddlewares);
      }

      if (response.schema) {
        processedMiddlewares.push(Router.createResponseFormatter(response.schema));
      }

      this.router[method](path, ...processedMiddlewares, handler as RequestHandler);
    };
  }

  static createResponseFormatter(schema: ZodSchema) {
    const jsonResponseSchema: any = zodToJsonSchema(schema, { target: 'openApi3' });
    const stringify = fastJson(jsonResponseSchema);

    const errorSchema = z.union([
      z.record(z.unknown()),
      z.array(z.record(z.unknown()))
    ]);
    const jsonErrorSchema: any = zodToJsonSchema(errorSchema, { target: 'openApi3' });
    const errStringify = fastJson(jsonErrorSchema);

    return (_req: Request, res: Response, next: NextFunction) => {
      res.json = <T extends object>(data: T) => {
        res.setHeader('Content-Type', 'application/json');
        if (data instanceof HttpError) {
          return res.send(errStringify(data.errors));
        }
        return res.send(stringify(data));
      };
      next();
    };
  }

  private registerWithOpenAPI<
    Params extends AnyZodObject | typeof emptyObjectSchema,
    ResBody,
    ReqBody,
    Query extends AnyZodObject | typeof emptyObjectSchema
  >(
    method: HttpMethod,
    path: string,
    options: RouteOptions<Params, ResBody, ReqBody, Query>,
    response: { statusCode: number, schema: ZodSchema },
    middlewares: any[]
  ) {
    const security = [];
    if (options.auth) security.push({ Authorization: [] });
    if (middlewares.some(m => m.name === 'resetStepValidator')) {
      security.push({ Reset: [] });
    }

    const responseSchemas = {
      [response.statusCode]: {
        description: response.statusCode.toString().startsWith('2') ? 'Success' : 'Error',
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

    Router.registry.registerPath({
      tags: [this.resourceName],
      method,
      path: fullPath,
      summary: options.summary,
      description: options.description,
      security,
      request: {
        params: options.schema?.params,
        body: options.schema?.body ? {
          description: (options.schema.body as any).description,
          content: {
            'application/json': {
              schema: options.schema.body
            }
          }
        } : undefined,
        query: options.schema?.query
      },
      responses: responseSchemas
    });
  }

  public static getRegistry(): OpenAPIRegistry {
    return Router.registry;
  }
}

export default Router;