/* eslint-disable @typescript-eslint/no-unused-vars */

import { Router, Request, Response, NextFunction } from 'express';
import { validateRequest } from '../../middleware/validationMiddleware';
import { CategoryInterface, categorySchema } from './types';
import { sql } from '../../db';

interface RouteConfig {
  method: 'get' | 'post' | 'put' | 'delete';
  path: string;
  paramsSchema?: object;
  responseSchema?: object;
  bodySchema?: object;
  querySchema?: object;
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
function createRouteConfig({
  method,
  path,
  paramsSchema,
  responseSchema,
  bodySchema,
  querySchema,
  handler,
}: RouteConfig) {
  return {
    method,
    path,
    validate: validateRequest({ response:categorySchema.array()}),
    handler,
  };
}

const SQL_GET_ALL_CATEGORIES = sql<Record<string,never>, CategoryInterface>(`
  SELECT id, name, description, image_url 
  FROM categories 
  WHERE deleted_at IS NULL
`);

export default (router: Router) => {
  const routeConfig = createRouteConfig({
    method: 'get',
    path: '/',
    responseSchema: categorySchema.array(),
    handler: async (_req, res, next) => {
      try {
        console.log('Route handler executed');
        const categories = await SQL_GET_ALL_CATEGORIES({}).many();
        console.log(`after fetch: ${typeof categories}`);
        res.json(categories);
      } catch (error) {
        next(error);
      }
    },
  });

  router[routeConfig.method](
    routeConfig.path,
    routeConfig.handler
  );
};