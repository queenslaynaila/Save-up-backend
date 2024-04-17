import { z } from "zod";
import * as yaml from 'yaml';
import * as fs from 'fs';
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { GetInviteSchema } from '../../types';

extendZodWithOpenApi(z);
const registry = new OpenAPIRegistry();
enum Method {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
}

const createExpense = {
  method: Method.POST,
  path: '/invitations/{groupId}',
  summary: 'Invite a user to a certain group',
  tags: ['Invitations'],
  request: {
    params: z.object({
      phone_number: z.string()
    })
  },
  responses: {
    200: {
      description: 'Invite sent successfully'
    },
    400: {
      description: 'User already has a pending invitation for this group'
    },
    404: {
      description:'User already has a pending invitation for this group'
    },
    500: {
      description: 'Internal server error.'
    }
  }
};
  
const getExpenseById = {
  method: Method.GET,
  path: '/invitations/my-invites',
  summary: 'Get recived group invites',
  tags: ['Invitations'],
  responses: {
    200: {
      description: 'Saving created successfully.',
      content: {
        'application/json': {
          schema: z.array(GetInviteSchema)
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

const getExpensesByCriteria = {
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

const updateExpenses = {
  method: Method.PATCH,
  path: '/savings/records/{id}',
  summary: 'Get a saving by ID',
  tags: ['Savings'],
  request: {
    params: z.object({
      id: z.string()
    })
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

const deleteExpenses = {
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
  
registry.registerPath(createExpense);
registry.registerPath(getExpenseById);
registry.registerPath(getExpensesByCriteria);
registry.registerPath(updateExpenses);
registry.registerPath(deleteExpenses);

function getOpenApiDocumentation() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  generator.generateComponents();

  return generator.generateDocument({
    info: {
      version: '1.0.0',
      title: 'SAPI',
      description: 'API for managing invitations',
    },
    tags: [
      { name: 'Savings', description: 'Endpoints for managing invitations' },
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
