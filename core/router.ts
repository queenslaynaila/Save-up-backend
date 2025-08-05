import {
  Router as ExpressRouter,
  Request,
  Response,
  NextFunction,
  RequestHandler
} from 'express';
import z, {
  ZodArray,
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
import Ajv, { ErrorObject, ValidateFunction } from 'ajv';
import rateLimit from 'express-rate-limit';
import addFormats from 'ajv-formats';
import { authMiddleware } from '../utils';
import fastJson, { Schema } from 'fast-json-stringify';

extendZodWithOpenApi(z);

const ajv = new Ajv({
  coerceTypes: true,
  useDefaults: true
});

addFormats(ajv, {
  mode: 'fast',
  formats: ['date-time', 'date']
});

const precompiledValidators = new Map<string, {
  body?: ValidateFunction;
  query?: ValidateFunction;
  params?: ValidateFunction;
}>();

const allRegisteredRoutes = new Map<string, { method: HttpMethod; path: string; hasValidators: boolean }>();

const validateWithPrecompiledSchema = (
  validator: ValidateFunction,
  data: unknown,
  section: 'body' | 'query' | 'params'
) => {
  const valid = validator(data);

  if (!valid) {
    const errors = validator.errors?.map((err: ErrorObject) => ({
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

type HttpMethod = 'get' | 'post' | 'patch' | 'delete' | 'put';
type EmptyObjectSchema = ZodObject<Record<string, never>>;

interface RouteOptions<
  Params extends ZodObject<ZodRawShape> = EmptyObjectSchema,
  ResBody extends ZodType = EmptyObjectSchema,
  ReqBody extends ZodObject | ZodRecord| ZodArray<ZodType> |
  ZodUnion<[ZodObject, ZodObject]> | ZodUndefined = EmptyObjectSchema,
  Query extends ZodObject<ZodRawShape> = EmptyObjectSchema
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
  handler: RequestHandler<z.infer<Params>, z.infer<ResBody>, z.infer<ReqBody>, z.infer<Query>>;
}

type SpecificRouteMethodHandler = <
  Params extends ZodObject<ZodRawShape> = EmptyObjectSchema,
  ResBody extends ZodType = EmptyObjectSchema,
  ReqBody extends ZodObject | ZodRecord| ZodArray<ZodType> |
  ZodUnion<[ZodObject, ZodObject]> | ZodUndefined = EmptyObjectSchema,
  Query extends ZodObject<ZodRawShape> = EmptyObjectSchema
>(options: RouteOptions<Params, ResBody, ReqBody, Query>) => void;

export class Router {
  private static registry = new OpenAPIRegistry();

  private static routerInstances = new Map<string, Router>();

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

  /**
   * @param resourceName The name of the resource for which this router is created.
   * @param isResourceNameSuffixedInUrl Controls whether the resource name appears as a prefix or suffix in URLs..
   * 
   * @example
   * // Prefix pattern (default): resource name comes first
   * new Router('Pockets', false) 
   * // Results in URLs like: /saveup/pockets/me
   * 
   * @example
   * // Suffix pattern: resource name comes after the path
   * new Router('Pockets', true)
   * // Results in URLs like: /saveup/me/pockets
   */
  constructor(resourceName: string, isResourceNameSuffixedInUrl = false) {
    this.router = ExpressRouter();
    this.resourceName = resourceName;

    if (isResourceNameSuffixedInUrl) {
      this.routePrefix   = '/saveup/'
    } else {
      this.routePrefix = `/saveup/${resourceName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')}`;
    }

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

  public static getRegistry(): OpenAPIRegistry {
    return Router.registry;
  }

  public static createResourceRouter(resourceName: string, suffixResource = false): Router {
    const key = `${resourceName}-${suffixResource}`;
    if (!this.routerInstances.has(key)) {
      this.routerInstances.set(key, new Router(resourceName, suffixResource));
    }

    return this.routerInstances.get(key)!;
  }

  protected createMethodHandler(method: HttpMethod): SpecificRouteMethodHandler {
    return <
      Params extends ZodObject<ZodRawShape> = EmptyObjectSchema,
      ResBody extends ZodType = EmptyObjectSchema,
      ReqBody extends ZodObject | ZodRecord| ZodArray<ZodType> |
      ZodUnion<[ZodObject, ZodObject]> | ZodUndefined = EmptyObjectSchema,
      Query extends ZodObject<ZodRawShape> = EmptyObjectSchema
    >(options: RouteOptions<Params, ResBody, ReqBody, Query>) => {
      const { path, handler, response: resOpt } = options;
       const routeKey = this.generateRouteKey(method, path);
        allRegisteredRoutes.set(routeKey, {
        method,
        path,
        hasValidators: !!options.schema
      });

      if (options.schema) {
        this.precompileSchemasForValidation(routeKey, options.schema);
      }

      const response = {
        statusCode: resOpt?.statusCode ?? (resOpt?.schema ? 200 : 204),
        schema: resOpt?.schema ?? z.object({})
      };

      const middlewares = this.buildMiddlewareStack(routeKey, options);

      if (!options.hidden) {
        this.registerWithOpenAPI(method, path, options, response, middlewares);
      }

      if (response.schema) {
        middlewares.push(Router.createResponseFormatter(response.schema));
      }

      this.router[method](path, ...middlewares, handler as RequestHandler);
    };
  }

  private buildMiddlewareStack<
    Params extends ZodObject<ZodRawShape> = EmptyObjectSchema,
    ResBody extends ZodType = EmptyObjectSchema,
    ReqBody extends ZodObject | ZodRecord| ZodArray<ZodType> |
    ZodUnion<[ZodObject, ZodObject]> | ZodUndefined = EmptyObjectSchema,
    Query extends ZodObject<ZodRawShape> = EmptyObjectSchema
  >(routeKey:string, options: RouteOptions<Params, ResBody, ReqBody, Query>): RequestHandler[] {
    const middlewares: RequestHandler[] = [];
    if (options.schema) {
      middlewares.push(this.createPrecompiledValidationMiddleware(routeKey));
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

  private createPrecompiledValidationMiddleware(routeKey: string): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction) => {
      const validators = precompiledValidators.get(routeKey)!;

      if (validators.body) {
        validateWithPrecompiledSchema(validators.body, req.body, 'body');
      }
      if (validators.query) {
        validateWithPrecompiledSchema(validators.query, req.query, 'query');
      }
      if (validators.params) {
        validateWithPrecompiledSchema(validators.params, req.params, 'params');
      }

      next();
    };
  }
  
  private precompileSchemasForValidation<
    Params extends ZodObject<ZodRawShape> = EmptyObjectSchema,
    ReqBody extends ZodObject | ZodRecord| ZodArray<ZodType> |
    ZodUnion<[ZodObject, ZodObject]> | ZodUndefined = EmptyObjectSchema,
    Query extends ZodObject<ZodRawShape> = EmptyObjectSchema
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

    if (schema.params) {
      const jsonSchema = z.toJSONSchema(schema.params, { target: 'draft-7' });
      validators.params = ajv.compile(jsonSchema);
    }

    if (schema.body) {
      const jsonSchema = z.toJSONSchema(schema.body, { target: 'draft-7' });
      validators.body = ajv.compile(jsonSchema);
    }

    if (schema.query) {
      const jsonSchema = z.toJSONSchema(schema.query, { target: 'draft-7' });
      validators.query = ajv.compile(jsonSchema);
    }

    precompiledValidators.set(routeKey, validators);
  }

  private generateRouteKey(method: HttpMethod, path: string): string {
    return `${method}:${this.resourceName}:${path}`;
  }

  static createResponseFormatter(schema: ZodType) {
    const jsonResponseSchema = z.toJSONSchema(schema, {target: 'draft-7'});
    const stringify = fastJson(jsonResponseSchema as Schema);

    const errorSchema = z.union([
      z.record(z.string(), z.unknown()),
      z.array(z.record(z.string(), z.unknown()))
    ]);
    const jsonErrorSchema = z.toJSONSchema(errorSchema, {target: 'draft-7'});
    const errStringify = fastJson(jsonErrorSchema as Schema);

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
    Params extends ZodObject<ZodRawShape> = EmptyObjectSchema,
    ResBody extends ZodType = EmptyObjectSchema,
    ReqBody extends ZodObject | ZodRecord| ZodArray<ZodType> |
    ZodUnion<[ZodObject, ZodObject]> | ZodUndefined = EmptyObjectSchema,
    Query extends ZodObject<ZodRawShape> = EmptyObjectSchema
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
}

export default Router;