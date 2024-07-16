// /* eslint-disable @typescript-eslint/no-unused-vars */
// import { Router } from 'express';
// import { z } from 'zod';
// import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
// import validateRequest from '../../middleware/validationMiddleware';
// import authMiddleware from '../../middleware/authorization';
// import getAllCategories from './getAllCategories';

// type RouteDefinition = {
//   method: 'get' | 'post' | 'patch' | 'delete';
//   path: string;
//   summary: string;
//   request: {
//     headers?: z.ZodSchema;
//     params?: z.ZodSchema;
//     query?: z.ZodSchema;
//     body?: z.ZodSchema;
//     response?: z.ZodSchema;
//   };
//   responses: {
//     [status: number]: {
//       schema? : z.ZodSchema;
//     };
//   };
// };

// export const createRoute = (router: Router, registry: OpenAPIRegistry,routeDef: RouteDefinition) => {
//   const { method, path, summary, description, request, responses } = routeDef;

//   registry.registerPath({
//     method,
//     path,
//     summary,
//     description,
//     request: {
//       headers: request.headers? {
//         content: {
//           'application/json': {
//             schema: request.body,
//           },
//         },
//       }: undefined,
//       params: request.params ? {
//         content: {
//           'application/json': {
//             schema: request.body,
//           },
//         },
//       }: undefined,
//       query: request.query ? {
//         content: {
//           'application/json': {
//             schema: request.body,
//           },
//         },
//       }: undefined,
//       body: request.body? {
//         content: {
//           'application/json': {
//             schema: request.body,
//           },
//         },
//       }: undefined
//     },
//     responses: Object.fromEntries(
//       Object.entries(responses).map(([status, { description, schema }]) => [
//         status,
//         {
//           description,
//           content: {
//             'application/json': {
//               schema,
//             },
//           },
//         },
//       ])
//     ),
//   });
// };

