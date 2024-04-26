import { z } from "zod";
import * as yaml from 'yaml';
import * as fs from 'fs';
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { securityQuestionSchema, Method } from '../../globalTypes';

extendZodWithOpenApi(z);
const registry = new OpenAPIRegistry();

registry.registerPath({
  method: Method.GET,
  path: '/security-questions',
  summary: 'Get all security questions',
  tags: ['Security Questions'],
  responses: {
    200: {
      description: 'List of security questions',
      content: {
        'application/json': {
          schema:securityQuestionSchema
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
      title: 'Security Questions API',
      description: 'API for managing security questions',
    },
    tags: [
      { name: 'Security Questions', description: 'Endpoints for managing security questions' },
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
