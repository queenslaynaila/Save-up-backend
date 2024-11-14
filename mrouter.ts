/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Router as ExpressRouter, Request, Response, NextFunction, Application } from 'express';
import { AnyZodObject, ZodSchema } from 'zod';
import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import fastJson from 'fast-json-stringify';
import zodToJsonSchema from 'zod-to-json-schema';
import Ajv, { ErrorObject } from 'ajv';
import { HttpError } from './middleware/errorMiddleware';

const ajv = new Ajv();

const validateSchema = (schema: ZodSchema, data: unknown, section: 'body' | 'query' | 'params') => {
  const jsonSchema = zodToJsonSchema(schema, { target: 'openApi3' });
  const validate = ajv.compile(jsonSchema);
  const valid = validate(data);

  if (!valid) {
    const errors = validate.errors?.map((err: ErrorObject) => ({
      section,
      message: err.message,
      params: err.params
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

interface RouterOptions {
  method: 'get' | 'post' | 'patch' | 'delete';
  path: string;
  summary: string;
  description?: string;
  schema?: {
    body?: ZodSchema;
    query?: AnyZodObject;
    params?: AnyZodObject;
  };
  response?: {
    description?: string;
    statusCode?: number;
    schema?: ZodSchema;
  };
  middlewares?: Array<(req: Request, res: Response, next: NextFunction) => void>;
  handler: (req: Request, res: Response, next: NextFunction) => void;
}

const registry = new OpenAPIRegistry();

class Router {
  private router: ExpressRouter = ExpressRouter();

  private prefix: string;

  private tag?: string;

  private static app: Application;

  private app: Application = express();

  // private static registeredRoutes: Array<string> = [];

  constructor(prefix: string, tag?: string) {
    this.router = ExpressRouter();
    this.prefix = prefix;
    this.tag = tag;

    this.app.use(this.prefix, this.router);
  }

  public static getInstance(prefix: string, tag?: string): Application {
    if (!Router.app) {
      const router = new Router(prefix, tag);
      Router.app = express();
      Router.app.use(router.prefix, router.router);
    }
    return Router.app;
  }

  public route(options: RouterOptions) {
    const { method, path, schema, response, middlewares = [], handler } = options;

    if (schema) {
      middlewares.push(validateRequest(schema));
    }

    const responseSchema = response?.schema;
    const statusCode = String(response?.statusCode || 200);
    const description = response?.description || 'Success';

    registry.registerPath({
      tags: this.tag ? [this.tag] : undefined,
      method,
      path: `${this.prefix}${path}`,
      summary: options.summary,
      description: options.description,
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

      middlewares.push((_req: Request, res: Response, next: NextFunction) => {
        res.json = <T extends object>(data: T) => {
          res.setHeader('Content-Type', 'application/json');
          return res.send(stringify(data));
        };
        next();
      });
    }

    this.router[method](path, ...middlewares, handler);
    console.log(`Registered route ${method.toUpperCase()} ${this.prefix}${path}`);
  }
}

registry.registerComponent(
  'securitySchemes',
  'authorization-token',
  {
    name: 'authorization-token',
    type: 'apiKey',
    scheme: 'Bearer',
    bearerFormat: 'JWT',
    in: 'header',
    description: 'JWT authorizatiion using the bearer scheme'
  }
);

export const generateOpenApiSpec = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'API Documentation for Saveup',
      version: '1.0.0',
      description: 'This is the API documentation for Saveup. Saveup is a platform that helps users manage their savings and financial goals'
    }
  });
};

export default Router;