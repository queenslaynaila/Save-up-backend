import express, {
  Router as ExpressRouter,
  Request,
  Response,
  NextFunction,
  Application,
  RequestHandler
} from 'express';
import { AnyZodObject, TypeOf, z, ZodNever, ZodRecord, ZodSchema, ZodUndefined, ZodUnion } from 'zod';
import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import fastJson from 'fast-json-stringify';
import zodToJsonSchema from 'zod-to-json-schema';
import Ajv, { ErrorObject } from 'ajv';
import basicAuth from 'express-basic-auth';
import cors from 'cors';
import HttpError from './httpError';
import Config from './config';
import {authMiddleware } from './utils';
import { Role } from './routes/users/schema';


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
  return (req: Request, _res: Response, next: NextFunction) => {
    if (schema.body) validateSchema(schema.body, req.body, 'body');
    if (schema.query) validateSchema(schema.query, req.query, 'query');
    if (schema.params) validateSchema(schema.params, req.params, 'params');
    next();
  };
};

type HttpMethod = 'get' | 'post' | 'patch' | 'delete' | 'put';
const emptyObjectSchema = z.object({}).strict();

interface RouterOptions<
  Params extends AnyZodObject | ZodNever = ZodNever,
  ResBody = ZodSchema | ZodNever,
  ReqBody = ZodSchema | ZodNever,
  QueryParams extends AnyZodObject = AnyZodObject
> {
  method: HttpMethod;
  path: string;
  hidden?: boolean;
  summary?: string;
  description?: string;
  schema?: {
    params?: Params;
    body?: ZodSchema<ReqBody>;
    query?: QueryParams;
  };
  response?: {
    statusCode?: number;
    schema?: ZodSchema<ResBody> | ZodUndefined;
    description?: string;
  };
  auth?: true | Role | Role[];
  middlewares?: Array<(req: Request, res: Response, next: NextFunction) => void>;
  handler: RequestHandler<TypeOf<Params>, ResBody, ReqBody, TypeOf<QueryParams>>;
}

const registry = new OpenAPIRegistry();

class Router {
  private static app: Application = express();
  private static routerInstances: Map<string, Router> = new Map();

  private readonly router: ExpressRouter;
  private readonly routePrefix: string;
  private readonly apiTag?: string;

  private constructor(routePrefix: string, apiTag?: string) {
    this.router = ExpressRouter();;
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
    const key = `${routePrefix}::${apiTag}`;  

    if (!Router.routerInstances.has(key)) {
        Router.routerInstances.set(key, new Router(routePrefix, apiTag));
    }

    return Router.routerInstances.get(key)!;
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
      response = { statusCode: 200, schema: z.never() },
      auth,
      middlewares = [],
      handler
    } = options;

    if (schema) middlewares.unshift(validateRequest(schema));
    if (auth) middlewares.splice(1, 0, authMiddleware(auth));
    
    const security = [];
    if (auth) security.push({ Authorization: [] });
    if (middlewares.some(m => m.name === "resetStepValidator")) {
      security.push({ Reset: [] });
    }

    const responseSchemas  = response.schema ? {
        [response.statusCode || 200]:{
          description: response.statusCode?.toString().startsWith("2") ? "Success" : "Error",
          content:{
            "application/json":{
              schema: zodToJsonSchema(response.schema, { target: "openApi3" })
            }
          }
        }
      } : {}


    const transformedPath = path.replace(/:([^/]+)/g, '{$1}');
    const fullPath = `${this.routePrefix}${transformedPath}`.replace(/\/+/g, '/');

    if(!options.hidden){
      registry.registerPath({
        tags: this.apiTag ? [this.apiTag] : undefined,
        method,
        path: fullPath,
        summary: options.summary,
        description: options.description,
        security,
        request: {
          params: schema?.params,
          body: schema?.body ? { content: { 'application/json': { schema: schema.body } } } : undefined,
          query: schema?.query
        },
        responses: responseSchemas
      });
    }

    if (response.schema) {
      const jsonResponseSchema: any = zodToJsonSchema(response.schema, { target: "openApi3" });
      const stringify = fastJson(jsonResponseSchema);
      
      middlewares.push((_req: Request, res: Response, next: NextFunction) => {
        res.json = <T extends object>(data: T) => {
          res.setHeader("Content-Type", "application/json");
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
      version: '1.0.0'
    },
    security: [
      {
        Authorization: []
      }
    ]
  });
};

export default Router;