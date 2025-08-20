import {
  Router as ExpressRouter,
  Request,
  Response,
  NextFunction,
  RequestHandler
} from 'express';
import z, {
  ZodArray,
  ZodNever,
  ZodObject,
  ZodRawShape,
  ZodRecord,
  ZodType,
  ZodUndefined,
  ZodUnion
} from 'zod';
import { Role } from '../routes/users/schema';
import { extendZodWithOpenApi, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import HttpError from '../httpError';
import Ajv, { ValidateFunction } from 'ajv';
import rateLimit from 'express-rate-limit';
import addFormats from 'ajv-formats';
import fastJson, { Schema } from 'fast-json-stringify';
import { validateAndDecodeJwt } from '../utils';

extendZodWithOpenApi(z);

function authMiddleware(auth: true | Role | Role[] = true) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
      throw new HttpError(401);
    }

    const decoded = validateAndDecodeJwt(req.headers.authorization);

    if (!decoded.id || !decoded.role) {
      throw new HttpError(400);
    }

    req.user = { id: decoded.id, role: decoded.role };

    if (auth !== true) {
      const allowedRoles = Array.isArray(auth) ? auth : [auth];
      if (!allowedRoles.includes(req.user.role)) {
        throw new HttpError(403);
      }
    }

    next();
  };
}

const ajv = new Ajv({coerceTypes: true, useDefaults: true});
addFormats(ajv, {mode: 'fast', formats: ['date-time', 'date']});

const routeRequestValidators = new Map<string, {
  body?: ValidateFunction;
  query?: ValidateFunction;
  params?: ValidateFunction;
}>();

function buildRequestValidatorsForRoute<
  Params extends ZodObject<any> | undefined = undefined,
    ReqBody extends
    | ZodObject
    | ZodRecord
    | ZodArray<ZodType>
    | ZodUnion<[ZodObject, ZodObject]>
    | ZodUndefined
    | undefined = undefined,
  Query extends ZodObject<ZodRawShape> | undefined = undefined
>(
  routeKey: string, 
  schema: {
    params?: Params;
    body?: ReqBody;
    query?: Query;
  }
): void {
  const validators: {
    params?: ValidateFunction;
    body?: ValidateFunction;
    query?: ValidateFunction;
  } = {};

   (['params', 'body', 'query'] as const).forEach(section => {
    if (schema[section]) {
      const jsonSchema = z.toJSONSchema(schema[section], { target: 'draft-7' });
      validators[section] = ajv.compile(jsonSchema);
    }
  });

  routeRequestValidators.set(routeKey, validators);
}

const routeResponseSerializers = new Map<string, {
  serialize: (data: any) => string
}>();

function buildResponseSerializersForRoute(routeKey: string, responseSchema: ZodType): void {
  const jsonResponseSchema = z.toJSONSchema(responseSchema, { target: 'draft-7' });
  const serialize = fastJson(jsonResponseSchema as Schema);
  routeResponseSerializers.set(routeKey, {
    serialize
  });
}

function createValidationMiddleware(routeKey: string): RequestHandler {
  return (req, _res, next) => {
    const validators = routeRequestValidators.get(routeKey);

    if (!validators) return next();

    for (const section of ['body', 'query', 'params'] as const) {
      const validator = validators[section];
      if (!validator) continue;

      const valid = validator(req[section]);
      if (!valid) {
        const errors = validator.errors?.map(err => ({
          section,
          message: err.message,
          params: err.params,
          keyword: err.keyword,
          dataPath: err.instancePath,
          schemaPath: err.schemaPath
        }));
        throw new HttpError(400, errors);
      }
    }

    next();
  };
}

type HttpMethod = 'get' | 'post' | 'patch' | 'delete' | 'put';


type InferShape<T> =
  T extends ZodNever ? never :
  T extends ZodObject<ZodRawShape> ? z.infer<T> :
  T extends ZodRecord ? z.infer<T> :
  T extends ZodArray<any> ? z.infer<T> :
  T extends ZodUnion<[ZodObject<any>, ZodObject<any>]> ? z.infer<T> :
  T extends ZodUndefined ? undefined :
  {};
  
interface RouteOptions<
  Params extends ZodObject<ZodRawShape> | undefined = undefined,
  ResBody extends ZodType | ZodNever = ZodNever,
  ReqBody extends
    | ZodObject
    | ZodRecord
    | ZodArray<ZodType>
    | ZodUnion<[ZodObject, ZodObject]>
    | ZodUndefined
    | undefined = undefined,
  Query extends ZodObject<ZodRawShape> | undefined = undefined
> {
  path: string;
  hidden?: boolean;
  summary?: string;
  description?: string;
  schema?: {
    params?: Params;
    body?: ReqBody;
    query?: Query;
  };
  response?: {
    statusCode?: number;
    schema?: ResBody;
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
  handler: RequestHandler<
    InferShape<Params>, 
    InferShape<ResBody>, 
    InferShape<ReqBody>, 
    InferShape<Query>
  >;
}

type RouteHandler = <
  Params extends ZodObject<any> | undefined = undefined,
  ResBody extends ZodType | ZodNever = ZodNever,
  ReqBody extends
    | ZodObject
    | ZodRecord
    | ZodArray<ZodType>
    | ZodUnion<[ZodObject, ZodObject]>
    | ZodUndefined
    | undefined = undefined,
  Query extends ZodObject<ZodRawShape> | undefined = undefined
>(options: RouteOptions<Params, ResBody, ReqBody, Query>) => void;

export const BASE_PATH = '/saveup';

export class Router {
  private static registry = new OpenAPIRegistry();

  private static routerInstances = new Map<string, Router>();

  protected readonly router: ExpressRouter;

  protected readonly resourceName: string;

  protected readonly basePath: string;

  public readonly get: RouteHandler;

  public readonly post: RouteHandler;

  public readonly put: RouteHandler;

  public readonly patch: RouteHandler;

  public readonly delete: RouteHandler;

  constructor(resourceName: string, isResourceNameSuffixedInUrl = false) {
    this.router = ExpressRouter();
    this.resourceName = resourceName;

    if (isResourceNameSuffixedInUrl) {
      this.basePath   = `${BASE_PATH}`
    } else {
      this.basePath = `${BASE_PATH}/${resourceName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')}`;
    }

    this.get = this.buildRouteForMethod('get');
    this.post = this.buildRouteForMethod('post');
    this.put = this.buildRouteForMethod('put');
    this.patch = this.buildRouteForMethod('patch');
    this.delete = this.buildRouteForMethod('delete');
  }

  public getExpressRouter(): ExpressRouter {
    return this.router;
  }

  public getBasePath(): string {
    return this.basePath;
  }

  public static getOpenApiRegistry(): OpenAPIRegistry {
    return Router.registry;
  }

   /**
   * Creates or retrieves a Router instance for a given resource name.
   * @param resourceName The name of the resource for which this router is created ie. "Pockets".
   * @param isResourceNameSuffixedInUrl Controls whether the resource name appears as a prefix or suffix in URLs.
   *
   * @example
   * // Prefix pattern (default): resource name comes first
   * new Router('Pockets', false) path written as /me
   * // Results in URLs like: /pockets/me
   * 
   * @example
   * // Suffix pattern: resource name comes after the path
   * new Router('Pockets', true) path written as /me
   * // Results in URLs like: /me/pockets
   */

  public static getOrCreateRouter(resourceName: string, isResourceNameSuffixedInUrl = false): Router {
    const key = `${resourceName}-${isResourceNameSuffixedInUrl}`;
    if (!this.routerInstances.has(key)) {
      this.routerInstances.set(key, new Router(resourceName, isResourceNameSuffixedInUrl));
    }

    return this.routerInstances.get(key)!;
  }

  private buildRouteForMethod(method: HttpMethod): RouteHandler {
    return <
      Params extends ZodObject<any> | undefined = undefined,
      ResBody extends ZodType | ZodNever = ZodNever,
      ReqBody extends
        | ZodObject
        | ZodRecord
        | ZodArray<ZodType>
        | ZodUnion<[ZodObject, ZodObject]>
        | ZodUndefined
        | undefined = undefined,
      Query extends ZodObject<ZodRawShape> | undefined = undefined
    >(options: RouteOptions<Params, ResBody, ReqBody, Query>) => {
      const { path, handler, response: resOpt } = options;
      const routeKey = `${method}:${this.resourceName}:${path}`

      if (options.schema) {
        buildRequestValidatorsForRoute(routeKey, options.schema);
      }

      const response = {
        statusCode: resOpt?.statusCode ?? (resOpt?.schema ? 200 : 204),
        schema: resOpt?.schema ?? z.object({})
      };

      if (response.schema) {
        buildResponseSerializersForRoute(routeKey, response.schema);
      }

      const middlewares = this.buildMiddlewareStack(routeKey, options);

      if (!options.hidden) {
        this.registerRouteWithOpenAPI(method, path, options, response, middlewares);
      }

      if (response.schema) {
        middlewares.push(Router.buildSerializationMiddleware(routeKey));
      }

      this.router[method](path, ...middlewares, handler as RequestHandler);
    };
  }

  private buildMiddlewareStack<
    Params extends ZodObject<any> | undefined = undefined,
    ResBody extends ZodType | ZodNever = ZodNever,
    ReqBody extends
      | ZodObject
      | ZodRecord
      | ZodArray<ZodType>
      | ZodUnion<[ZodObject, ZodObject]>
      | ZodUndefined
      | undefined = undefined,
    Query extends ZodObject<ZodRawShape> | undefined = undefined
  >(routeKey:string, options: RouteOptions<Params, ResBody, ReqBody, Query>): RequestHandler[] {
    const middlewares: RequestHandler[] = [];
    if (options.schema) {
      middlewares.push(createValidationMiddleware(routeKey));
    }

    if (options.auth) {
      middlewares.push(authMiddleware(options.auth));
    }

    if (options.rateLimit) {
      const { limit, windowMs, message, skipForAdmins } = options.rateLimit;
      const rateLimitOptions = {
        windowMs,
        max: limit,
        message: message || 'Too many requests',
        skip: (req: Request) => Boolean(skipForAdmins && req.user?.role === 'Admin')
      };
      middlewares.push(rateLimit(rateLimitOptions));
    }

    if (options.middlewares) {
      middlewares.push(...options.middlewares);
    }

    return middlewares;
  }
  
  private registerRouteWithOpenAPI<
    Params extends ZodObject<any> | undefined = undefined,
    ResBody extends ZodType | ZodNever = ZodNever,
    ReqBody extends
      | ZodObject
      | ZodRecord
      | ZodArray<ZodType>
      | ZodUnion<[ZodObject, ZodObject]>
      | ZodUndefined
      | undefined = undefined,
    Query extends ZodObject<ZodRawShape> | undefined = undefined
  >(
    method: HttpMethod,
    path: string,
    options: RouteOptions<Params, ResBody, ReqBody, Query>,
    response: { statusCode: number, schema: ZodType },
    middlewares: RequestHandler[]
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
            schema: response.schema
          }
        }
      }
    };

    const transformedPath = path.replace(/:([^/]+)/g, '{$1}');
    const fullPath = `${this.basePath}${transformedPath}`
      .replace(/\/+/g, '/')
      .replace(/\/$/, '');

    const roles = Array.isArray(options.auth) ? options.auth : [options.auth]
    const roleDescription = options.auth !== true ?
    `Allowed for roles: **${roles.join(', ')}**`: '';

    Router.registry.registerPath({
      tags: [this.resourceName],
      method,
      path: fullPath,
      summary: options.summary,
      description: [
        roleDescription,
        options.description
      ].filter(Boolean).join('\n\n'),
      security,
      request: {
        params: options.schema?.params,
        body: options.schema?.body ? {
          description: (options.schema.body).description,
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

  static buildSerializationMiddleware(routeKey: string): RequestHandler {
    const { serialize } = routeResponseSerializers.get(routeKey)!;
    return (_req: Request, res: Response, next: NextFunction) => {
      res.json = <T extends object>(data: T) => {
        res.setHeader('Content-Type', 'application/json');
        if (data instanceof HttpError) {
          return res.send(JSON.stringify(data.errors));
        }
        return res.send(serialize(data));
      };
      next();
    };
  }
}

export default Router;