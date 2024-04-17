import { z } from "zod";
import * as yaml from 'yaml';
import * as fs from 'fs';
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { messageSchema, baseGoalSchema, idParamSchema,goalSchema, goalsByConditionsQuerySchema, Method } from '../../types';

extendZodWithOpenApi(z);
const registry = new OpenAPIRegistry();

const createGoal = {
  method: Method.POST,
  path: '/goals',
  summary: 'Create a goal',
  tags: ['Goals'],
  request: {
    body: {
      content: {
        'application/json': {
          schema:goalSchema.openapi('Goals'),
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Goal created successfully'
    },
    500: {
      description: 'Internal server error.'
    }
  }
};

const getGoalByGoalId = {
  method: Method.GET,
  path: '/goals/records/{id}',
  summary: 'Get a goals details by Id',
  tags: ['Goals'],
  request: {
    params: idParamSchema
  },
  responses: {
    200: {
      description: 'Goal retrieved successfully',
      content: {
        'application/json': {
          schema: goalSchema
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
  tags: ['Goals'],
  request: {
    params: idParamSchema,
    query:goalsByConditionsQuerySchema
  },
  responses: {
    200: {
      description: 'Goals retrieved successfully',
      content: {
        'application/json': {
          schema: z.array(baseGoalSchema)
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
  
const deleteGoal = {
  method: Method.GET,
  path: '/invitations/my-invites',
  summary: 'Get recived group invites',
  tags: ['Goals'],
  request: {
    params: idParamSchema
  },
  responses: {
    200: {
      description: 'Goal deleted successfully.',
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
registry.registerPath(deleteGoal);

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
