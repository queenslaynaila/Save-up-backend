// import { z } from "zod";
// import * as yaml from 'yaml';
// import * as fs from 'fs';
// import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
// import { createCategorySchema, categorySchema, categoriesArraySchema,  } from './types'
// import {Method } from '../../globalTypes/index';

// extendZodWithOpenApi(z);
// const registry = new OpenAPIRegistry();

  
// const getAllCategories = {
//   method: Method.GET,
//   path: '/categories',
//   summary: 'Returns an array of all categories object',
//   tags: ['Categories'],
//   responses: {
//     200: {
//       description: 'Categories retrieved successfully',
//       content: {
//         'application/json': {
//           schema: categoriesArraySchema
//         }
//       }
//     },
//     401: {
//       description:'Access Denied.Log in.'
//     },
//     500: {
//       description: 'Internal server error.'
//     }
//   }
// };



// registry.registerPath(getAllCategories);

// function getOpenApiDocumentation() {
//   const generator = new OpenApiGeneratorV3(registry.definitions);
//   generator.generateComponents();

//   return generator.generateDocument({
//     info: {
//       version: '1.0.0',
//       title: 'CATEGORIES API',
//       description: 'API for managing categories',
//     },
//     tags: [
//       { name: 'Categories', description: 'Endpoints for managing categories' },
//     ],
//     openapi: ""
//   });
// }

// function writeDocumentation() {
//   const docs = getOpenApiDocumentation();
//   const fileContent = yaml.stringify(docs);

//   fs.writeFileSync(`${__dirname}/swagger.yml`, fileContent, {
//     encoding: 'utf-8',
//   });
// }

// writeDocumentation();