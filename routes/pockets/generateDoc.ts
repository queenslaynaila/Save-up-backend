import { z } from "zod";
import * as yaml from 'yaml';
import * as fs from 'fs';
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { basePocketSchema, pocketSchema, pocketsByConditionsQuerySchema  } from './types';
import { messageSchema, idParamSchema, Method } from '../../globalTypes/index';

extendZodWithOpenApi(z);
const registry = new OpenAPIRegistry();

const createGoal = {
  method: Method.POST,
  path: '/pockets',
  summary: 'Create a goal',
  tags: ['Pockets'],
  request: {
    body: {
      content: {
        'application/json': {
          schema:pocketSchema.openapi('Pockets'),
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Pocket created successfully'
    },
    500: {
      description: 'Internal server error.'
    }
  }
};

const getGoalByGoalId = {
  method: Method.GET,
  path: '/pockets/records/{id}',
  summary: 'Get a pockets details by Id',
  tags: ['Pockets'],
  request: {
    params: idParamSchema
  },
  responses: {
    200: {
      description: 'Pocket retrieved successfully',
      content: {
        'application/json': {
          schema: pocketSchema
        }
      }
    },
    404: {
      description:'Not found'
    },
    500: {
      description: 'Internal server error.'
    }
  }
};
  
const getGoalsByCriteria = {
  method: Method.GET,
  path: '/savings/{savingIdentifier}',
  summary: 'Get savings by criteria',
  tags: ['Pockets'],
  request: {
    params: idParamSchema,
    query:pocketsByConditionsQuerySchema
  },
  responses: {
    200: {
      description: 'Pockets retrieved successfully',
      content: {
        'application/json': {
          schema: z.array(basePocketSchema)
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
  
const DeletePocket = {
  method: Method.GET,
  path: '/invitations/my-invites',
  summary: 'Get recived group invites',
  tags: ['Pockets'],
  request: {
    params: idParamSchema
  },
  responses: {
    200: {
      description: 'Pocket deleted successfully.',
      content: {
        'application/json': {
          schema:messageSchema
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
  
registry.registerPath(createGoal);
registry.registerPath(getGoalByGoalId);
registry.registerPath(getGoalsByCriteria);
registry.registerPath(DeletePocket);

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
