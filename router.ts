import express, {
  Router as ExpressRouter,
  Request,
  Response,
  NextFunction,
  Application,
  RequestHandler
} from 'express';
import { AnyZodObject, z, ZodNever, ZodSchema, ZodUndefined } from 'zod';
import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import fastJson from 'fast-json-stringify';
import zodToJsonSchema from 'zod-to-json-schema';
import Ajv, { ErrorObject } from 'ajv';
import basicAuth from 'express-basic-auth';
import cors from 'cors';
import HttpError from './httpError';
import Config from './config';
import {authMiddleware, AuthMiddlewareOptions } from './utils';


const ajv = new Ajv();

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

type HttpStatusCodes = 200 | 201 | 204 | 400 | 401 | 403 | 409 | 422 | 423 | 429;

type ResponseDefinition<ResBody, StatusCode extends HttpStatusCodes> = {
  schema?: StatusCode extends 204 ? ZodUndefined : ZodSchema<ResBody>;
  headers?: AnyZodObject;
};

type ResponseMap<ResBody> = { [StatusCode in HttpStatusCodes]?:
  ResponseDefinition<StatusCode extends 200 | 201 | 204 ? ResBody : any, StatusCode>;
};

interface RouterOptions<
  Params extends AnyZodObject | ZodNever = ZodNever,
  ResBody = ZodSchema | ZodNever,
  ReqBody = ZodSchema | ZodNever,
  QueryParams extends AnyZodObject = AnyZodObject
> {
  method: 'get' | 'post' | 'patch' | 'delete';
  path: string;
  summary?: string;
  description?: string;
  request?: {
    headers?: AnyZodObject;
    params?: Params;
    body?: ZodSchema<ReqBody>;
    query?: QueryParams;
  };
  response?: ResponseMap<ResBody>;
  authMiddlewareOptions?: AuthMiddlewareOptions;
  middlewares?: Array<(req: Request, res: Response, next: NextFunction) => void>;
  handler: RequestHandler<z.infer<Params>, ResBody, ReqBody, z.infer<QueryParams>>;
}
const emptyObjectSchema = z.object({}).strict();
const registry = new OpenAPIRegistry();

class Router {
  private static app: Application = express();

  private static routerInstances: Map<string, Router> = new Map();

  private readonly router: ExpressRouter;

  private readonly routePrefix: string;

  private readonly apiTag?: string;

  private constructor(routePrefix: string, apiTag?: string) {
    this.router = ExpressRouter();
    this.routePrefix = `/saveup${routePrefix}`;
    this.apiTag = apiTag;

    Router.app.use(this.routePrefix, this.router);
  }

  public static initialize() {
    Router.app.use(
      cors({
        origin: [
          'http://localhost:5173',
          'https://save-up-seven.vercel.app'
        ],
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
        exposedHeaders: ['Authorization', 'Reset'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Reset']
      })
    );
    Router.app.use(express.json());
    Router.app.use(
      ['/docs'],
      basicAuth({
        challenge: true,
        users: {
          [swaggerConfig.username!]: swaggerConfig.password!
        }
      })
    );
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
      request,
      response = { 204: { schema: undefined } },
      authMiddlewareOptions,
      middlewares = [],
      handler
    } = options;

    if (request) {
      middlewares.unshift(validateRequest(request));
    }

    if (authMiddlewareOptions) {
      middlewares.splice(1, 0,  authMiddleware(authMiddlewareOptions));
    }


    const security = [];
    if (authMiddlewareOptions) {
      security.push({ Authorization: [] });
    }
    if (middlewares?.some(m => m.name === "resetStepValidator")) {
      security.push({ Reset: [] });
    }

    const responseSchemas = Object.entries(response)
      .reduce((acc, [statusCode, { schema, headers }]) => {
        acc[statusCode] = {
          description: statusCode.startsWith('2') ? 'Success' : 'Error',
          content: schema ? {
            'application/json': {
              schema: zodToJsonSchema(schema, { target: 'openApi3' })
            }
          } : undefined,
          headers: headers ? Object.keys(headers.shape).reduce((headerAcc, key) => {
            return {
              ...headerAcc,
              [key]: {
                description: 'Response headers',
                schema: zodToJsonSchema(headers.shape[key], { target: 'openApi3' })
              }
            };
          }, {}) : undefined
        };
        return acc;
      }, {} as Record<string, any>);

    const transformedResponses = Object.entries(responseSchemas)
      .reduce((acc, [statusCode, schema]) => {
        acc[statusCode] = schema;
        return acc;
      }, {} as Record<string, any>);

    const transformedPath = path.replace(/:([^/]+)/g, '{$1}');

    registry.registerPath({
      tags: this.apiTag ? [this.apiTag] : undefined,
      method,
      path: `${this.routePrefix}${transformedPath}`,
      summary: options.summary,
      description: options.description,
      security,
      request: {
        params: request?.params,
        body: request?.body ? { content: { 'application/json': { schema: request.body } } } : undefined,
        query: request?.query,
        headers: request?.headers
      },
      responses: transformedResponses
    });

    const successResponseSchema = response[200]?.schema || response[201]?.schema;

    if (successResponseSchema) {
      const jsonResponseSchema: any = zodToJsonSchema(successResponseSchema, { target: 'openApi3' });
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

Router.initialize();

registry.registerComponent(
  'securitySchemes',
  'Authorization',
  {
    type: 'apiKey',
    name: 'Authorization',
    in: 'header',
    description: 'JWT Bearer token used for user authentication. The token must be included in the "Authorization" header as "Bearer <token>" for secure access to protected routes.'
  }
);

registry.registerComponent(
  'securitySchemes',
  'Reset',
  {
    type: 'apiKey',
    name: 'Reset',
    in: 'header',
    description: 'JWT token used to manage the multi-step password reset process. The token is generated at each step, and its payload indicates the user\'s current step. It ensures the user cannot skip steps and is required for every request in the reset process.'
  }
);

export const generateOpenApiSpec = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'API Documentation for Saveup',
      version: '1.0.0',
      description: 'This is the API documentation for Saveup.'
    },
    security: [
      {
        Authorization: []
      }
    ]
  });
};

export default Router;