/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */
import express, {
  Router as ExpressRouter,
  Request,
  Response,
  NextFunction,
  Application,
  RequestHandler
} from 'express';
import { AnyZodObject, z, ZodNever, ZodSchema } from 'zod';
import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import fastJson from 'fast-json-stringify';
import zodToJsonSchema from 'zod-to-json-schema';
import Ajv, { ErrorObject } from 'ajv';
import { HttpError } from './middleware/errorMiddleware';
import authMiddleware, { AuthMiddlewareOptions } from './middleware/authorization';

const ajv = new Ajv();

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
      dataPath: err.dataPath,
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
  return (req: Request, res: Response, next: NextFunction) => {
    if (schema.body) validateSchema(schema.body, req.body, 'body');
    if (schema.query) validateSchema(schema.query, req.query, 'query');
    if (schema.params) validateSchema(schema.params, req.params, 'params');
    next();
  };
};
const emptyObjectSchema = z.object({}).strict();
type InferZodType<T> = T extends AnyZodObject ? z.infer<T> : Record<string, never>;

interface RouterOptions<
  Params extends AnyZodObject | ZodNever = ZodNever,
  ResBody = ZodSchema | ZodNever,
  ReqBody = ZodSchema | ZodNever,
  Query extends AnyZodObject | ZodNever = ZodNever
> {
  method: 'get' | 'post' | 'patch' | 'delete';
  path: string;
  summary: string;
  description?: string;
  schema?: {
    body?: ZodSchema<ReqBody>;
    query?: Query;
    params?: Params;
  };
  response?: {
    description?: string;
    statusCode?: number;
    schema?: ZodSchema<ResBody>;
  };
  authMiddlewareOptions?: AuthMiddlewareOptions;
  middlewares?: Array<(req: Request, res: Response, next: NextFunction) => void>;
  handler: RequestHandler<InferZodType<Params>, ResBody, ReqBody, InferZodType<Query>>;
}

const registry = new OpenAPIRegistry();

class Router {
  private static app: Application = express();

  private static routerInstances: Map<string, Router> = new Map();

  private router: ExpressRouter;

  private routePrefix: string;

  private apiTag?: string;

  private constructor(routePrefix: string, apiTag?: string) {
    this.router = ExpressRouter();
    this.routePrefix = routePrefix;
    this.apiTag = apiTag;
    Router.app.use(express.json());
    Router.app.use(this.routePrefix, this.router);
  }

  public static getAppInstance(): Application {
    return Router.app;
  }

  public static getRouterInstance(routePrefix: string, apiTag?: string): Router {
    if (!Router.routerInstances.has(routePrefix)) {
      Router.routerInstances.set(routePrefix, new Router(routePrefix, apiTag));
    }
    return Router.routerInstances.get(routePrefix)!;
  }

  public route<
    Params extends AnyZodObject | typeof emptyObjectSchema = typeof emptyObjectSchema,
    ResBody = ZodSchema | ZodNever,
    ReqBody = ZodSchema | ZodNever,
    Query extends AnyZodObject | typeof emptyObjectSchema = typeof emptyObjectSchema
  >(options: RouterOptions<Params, ResBody, ReqBody, Query>) {
    const {
      method,
      path,
      schema,
      response,
      authMiddlewareOptions,
      middlewares = [],
      handler
    } = options;

    if (authMiddlewareOptions) {
      middlewares.unshift(authMiddleware(authMiddlewareOptions));
    }

    if (schema) {
      middlewares.push(validateRequest(schema));
    }

    const responseSchema = response?.schema;
    const statusCode = String(response?.statusCode || 200);
    const description = response?.description || 'Success';

    registry.registerPath({
      tags: this.apiTag ? [this.apiTag] : undefined,
      method,
      path: `${this.routePrefix}${path}`,
      summary: options.summary,
      description: options.description,
      security: authMiddlewareOptions ? [{ Authorization: [] }] : undefined,
      request: {
        params: schema?.params,
        body: schema?.body ? { content: { 'application/json': { schema: schema.body } } } : undefined,
        query: schema?.query
      },
      responses: {
        [statusCode]: {
          description: description || 'Success',
          content: responseSchema ? { 'application/json': { schema: responseSchema } } : undefined
        }
      }
    });

    if (responseSchema) {
      const jsonResponseSchema: any = zodToJsonSchema(responseSchema, { target: 'openApi3' });
      const stringify = fastJson(jsonResponseSchema);

      const errorSchema = z.union([
        z.record(z.unknown()),
        z.array(z.record(z.unknown()))
      ]);
      const jsonErrorSchema: any = zodToJsonSchema(errorSchema, { target: 'openApi3' });
      const errStringify = fastJson(jsonErrorSchema);

      middlewares.push((_req: Request, res: Response, next: NextFunction) => {
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

    this.router[method](path, ...middlewares, handler as RequestHandler);
  }
}

export const generateOpenApiSpec = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'API Documentation for Saveup',
      version: '1.0.0',
      description: 'This is the API documentation for Saveup.'
    }
  });
};

registry.registerComponent(
  'securitySchemes',
  'Authorization',
  {
    type: 'apiKey',
    name: 'Authorization',
    in: 'header',
    description: 'JWT authorization using the Bearer scheme'
  }
);

export default Router;