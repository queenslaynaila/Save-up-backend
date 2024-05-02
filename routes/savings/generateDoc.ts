import { z } from "zod";
import * as yaml from 'yaml';
import * as fs from 'fs';
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { validateSavingCreationSchema } from './types';
import { idParamSchema, Method } from '../../globalTypes/index';
 
extendZodWithOpenApi(z);
const registry = new OpenAPIRegistry();
const createSaving = {
  method: Method.POST,
  path: '/savings',
  summary: 'Create a saving',
  tags: ['Savings'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: validateSavingCreationSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Saving created successfully.',
    },
    403: {
      description: 'Unprocessable entity',
    },
    500: {
      description: 'Internal server error.',
    }
  }
};
  
const getSavingBySavingId = {
  method: Method.GET,
  path: '/savings/records/{id}',
  summary: 'Get a saving by ID',
  tags: ['Savings'],
  request: {
    params:idParamSchema
  },
  responses: {
    200: {
      description: 'Saving retrieved successfully',
    },
    403: {
      description: 'Unprocessable entity'
    },
    500: {
      description: 'Internal server error.'
    }
  }
};
  
const getSavingsByCriteria = {
  method: Method.GET,
  path: '/savings/{savingIdentifier}',
  summary: 'Get savings by criteria',
  tags: ['Savings'],
  request: {
    params: z.object({
      savingIdentifier: z.string()
    })
  },
  responses: {
    200: {
      description: 'Savings retrieved successfully',
    },
    403: {
      description: 'Unprocessable entity'
    },
    500: {
      description: 'Internal server error.'
    }
  }
};
  
registry.registerPath(createSaving);
registry.registerPath(getSavingBySavingId);
registry.registerPath(getSavingsByCriteria);

function getOpenApiDocumentation() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  generator.generateComponents();

  return generator.generateDocument({
    info: {
      version: '1.0.0',
      title: 'SAPI',
      description: 'API for managing savings',
    },
    tags: [
      { name: 'Savings', description: 'Endpoints for managing savings' },
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
