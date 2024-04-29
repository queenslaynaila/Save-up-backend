import { z } from "zod";
import * as yaml from 'yaml';
import * as fs from 'fs';
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { getTransactionRespSchema } from './types'
import { Method, idParamSchema } from '../../globalTypes/index';

extendZodWithOpenApi(z);
const registry = new OpenAPIRegistry();

registry.registerPath({
  method: Method.GET,
  path: '/transactions',
  summary: 'Get all transactions for a particular pocket.',
  tags: ['Transactions'],
  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      description: 'An array of transaction data',
      content: {
        'application/json': {
          schema:getTransactionRespSchema
        }
      }
    },
    401: {
      description: 'Access denied. Log in.'
    },
    500: {
      description: 'Internal server error.'
    }
  }
}); 

function getOpenApiDocumentation() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  generator.generateComponents();

  return generator.generateDocument({
    info: {
      version: '1.0.0',
      title: 'transactions API',
      description: 'API for managing transactions',
    },
    tags: [
      { name: 'Transfers', description: 'Endpoints for managing transactions' },
    ],
    openapi: ""
  });
}

function writeDocumentation() {
  const docs = getOpenApiDocumentation();
  const fileContent = yaml.stringify(docs);

  fs.writeFileSync(`${__dirname}/swagger.yml`, fileContent, {
    encoding: 'utf-8',
  });
}

writeDocumentation();
