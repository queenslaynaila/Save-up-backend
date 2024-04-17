import { z } from "zod";
import * as yaml from 'yaml';
import * as fs from 'fs';
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { UpdatedUserRoleSchema, BaseUserSchema } from '../../types';

extendZodWithOpenApi(z);
const registry = new OpenAPIRegistry();
enum Method {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
}

const createAdmin = {
  method: Method.POST,
  path: '/admin',
  summary: 'Create a new admin',
  tags: ['Admin'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: BaseUserSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Account created Succesfully.Procced to login'
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
    params: z.object({
      resource: z.string(),
      operator: z.string()
    }),
    query:z.object({
      user_id: z.string().optional(),
      priority: z.string().optional(),
      status: z.string().optional(),
      category_id: z.string().optional(),
      start_date: z.string().optional(),
      end_date: z.string().optional()
    })
  },
  responses: {
    200: {
      description: 'Stat computed succesfully.',
      content: {
        'application/json': {
          schema: z.object({
            totals: z.number()
          })
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
    params: z.object({
      roleToUpdate: z.string(),
      id: z.string()
    }),
  },
  responses: {
    200: {
      description: 'User role succesfully updated',
      content: {
        'application/json': {
          schema: UpdatedUserRoleSchema
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
