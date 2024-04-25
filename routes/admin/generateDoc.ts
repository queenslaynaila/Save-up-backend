import { z } from "zod";
import * as yaml from 'yaml';
import * as fs from 'fs';
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { baseUserSchema, statsParamSchema, statsQuerySchema, userRoleUpdateSchema, financialStatsSchema } from './types';
import { updatedUserRoleSchema, messageSchema, Method } from '../../types';

extendZodWithOpenApi(z);
const registry = new OpenAPIRegistry();

const createAdmin = {
  method: Method.POST,
  path: '/admin',
  summary: 'Create a new admin',
  tags: ['Admin'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: baseUserSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Account created Succesfully.Procced to login',
      content: {
        'application/json': {
          schema: messageSchema
        },
      }
    },
    500: {
      description: 'Internal server error.'
    }
  }
};
  
const getFinancialStats = {
  method: Method.GET,
  path: '/admin/financial-stats/{resource}/{operator}',
  summary: ' Get table statistics',
  tags: ['Admin'],
  request: {
    params:statsParamSchema,
    query:statsQuerySchema
  },
  responses: {
    200: {
      description: 'Stat computed succesfully.',
      content: {
        'application/json': {
          schema:financialStatsSchema
        }
      }
    },
    403: {
      description: 'Unprocessable entity',
    },
    500: {
      description: 'Internal server error.',
    }
  }
};
  
const updateUserRole = {
  method: Method.PATCH,
  path: '/admin/{roleToUpdate}/{id}',
  summary: 'Either upgrade or downgrade user role',
  tags: ['Admin'],
  request: {
    params: userRoleUpdateSchema,
  },
  responses: {
    200: {
      description: 'User role succesfully updated',
      content: {
        'application/json': {
          schema: updatedUserRoleSchema
        }
      }
    },
    403: {
      description: 'Unprocessable entity'
    },
    500: {
      description: 'Internal server error.'
    }
  }
};

registry.registerPath(createAdmin);
registry.registerPath(getFinancialStats);
registry.registerPath(updateUserRole);

function getOpenApiDocumentation() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  generator.generateComponents();

  return generator.generateDocument({
    info: {
      version: '1.0.0',
      title: 'SAPI',
      description: 'API for managing admins',
    },
    tags: [
      { name: 'Admin', description: 'Admin Only endpoints' },
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
