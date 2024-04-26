import { z } from "zod";
import * as yaml from 'yaml';
import * as fs from 'fs';
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { baseGroupSchema, Method, createGroupResponse, idParamSchema, commonGroupSchema } from '../../globalTypes';

extendZodWithOpenApi(z);
const registry = new OpenAPIRegistry();

const createGroup = {
  method: Method.POST,
  path: '/groups',
  summary: 'Create a group',
  tags: ['Groups'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: baseGroupSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Invite sent successfully',
      content: {
        'application/json': {
          schema:createGroupResponse.openapi('Groups')
        }
      }
    },
    500: {
      description: 'Internal server error.'
    }
  }
};

const getUserGroups = {
  method: Method.GET,
  path: '/groups/my-groups',
  summary: 'Get a logged in Users groups',
  tags: ['Groups'],
  responses: {
    200: {
      description: 'Groups retrieved successfully',
      content: {
        'application/json': {
          schema:createGroupResponse.openapi('Groups')
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

const getGroupMembers = {
  method: Method.GET,
  path: '/groups/{:id}',
  summary: 'Get members for a group',
  tags: ['Groups'],
  request: {
    params: idParamSchema,
  },
  responses: {
    200: {
      description: 'Get group members',
    },
    403: {
      description: 'Unprocessable entity'
    },
    500: {
      description: 'Internal server error.'
    }
  }
};
  
const getCommonGroups = {
  method: Method.GET,
  path: '/groups/common-groups/{id}',
  summary: 'Get common groups with a group member',
  tags: ['Groups'],
  request:{
    params: idParamSchema
  },
  responses: {
    200: {
      description: 'Saving created successfully.',
      content: {
        'application/json': {
          schema: z.array(commonGroupSchema)
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
  
registry.registerPath(createGroup);
registry.registerPath(getUserGroups);
registry.registerPath(getGroupMembers);
registry.registerPath(getCommonGroups);

function getOpenApiDocumentation() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  generator.generateComponents();

  return generator.generateDocument({
    info: {
      version: '1.0.0',
      title: 'SAPI',
      description: 'API for managing groups',
    },
    tags: [
      { name: 'Groups', description: 'Endpoints for managing groups' },
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
