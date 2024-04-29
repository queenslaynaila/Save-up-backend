import { z } from "zod";
import * as yaml from 'yaml';
import * as fs from 'fs';
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { transferSchema } from './types'
import { Method, messageSchema } from '../../globalTypes/index';

extendZodWithOpenApi(z);
const registry = new OpenAPIRegistry();

registry.registerPath({
  method: Method.POST,
  path: '/transfers',
  summary: 'Transfer money from main pocket to anotehr',
  tags: ['Security Questions'],
  request: {
    body: {
      content: {
        'application/json': {
          schema:transferSchema,
        },
      },
    },
  }, 
  responses: {
    200: {
      description: 'Trasfer of amount KES200 from pocket ${transfer.source_pocket_name} to pocket ${transfer.destination_pocket_name} successful!',
      content: {
        'application/json': {
          schema:messageSchema
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
      title: 'transfer API',
      description: 'API for managing transfers',
    },
    tags: [
      { name: 'Transfers', description: 'Endpoints for managing transfers' },
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
