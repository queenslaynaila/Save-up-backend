import { z } from "zod";
import * as yaml from 'yaml';
import * as fs from 'fs';
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { validateDepositCreationSchema } from './types';
import { idParamSchema, Method } from '../../globalTypes';
 
extendZodWithOpenApi(z);
const registry = new OpenAPIRegistry();
const createDeposit = {
  method: Method.POST,
  path: '/deposits',
  summary: 'Create a deposit',
  tags: ['Deposits'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: validateDepositCreationSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Deposit created successfully.',
    },
    403: {
      description: 'Unprocessable entity',
    },
    500: {
      description: 'Internal server error.',
    }
  }
};
  
const getDepositByDepositId = {
  method: Method.GET,
  path: '/deposits/records/{id}',
  summary: 'Get a deposit by ID',
  tags: ['Deposits'],
  request: {
    params:idParamSchema
  },
  responses: {
    200: {
      description: 'Deposit retrieved successfully',
    },
    403: {
      description: 'Unprocessable entity'
    },
    500: {
      description: 'Internal server error.'
    }
  }
};
  
const getDepositsByCriteria = {
  method: Method.GET,
  path: '/deposits/{depositIdentifier}',
  summary: 'Get deposits by criteria',
  tags: ['Deposits'],
  request: {
    params: z.object({
      depositIdentifier: z.string()
    })
  },
  responses: {
    200: {
      description: 'Deposits retrieved successfully',
    },
    403: {
      description: 'Unprocessable entity'
    },
    500: {
      description: 'Internal server error.'
    }
  }
};
  
registry.registerPath(createDeposit);
registry.registerPath(getDepositByDepositId);
registry.registerPath(getDepositsByCriteria);

function getOpenApiDocumentation() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  generator.generateComponents();

  return generator.generateDocument({
    info: {
      version: '1.0.0',
      title: 'SAPI',
      description: 'API for managing deposits',
    },
    tags: [
      { name: 'Deposits', description: 'Endpoints for managing deposits' },
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
