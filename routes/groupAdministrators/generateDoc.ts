import { z } from "zod";
import * as yaml from 'yaml';
import * as fs from 'fs';
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { nominatedAdminSchema, messageSchema, idParamSchema, nominateParamsSchema } from '../../types';

extendZodWithOpenApi(z);
const registry = new OpenAPIRegistry();
enum Method {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
}

const proposeGroupAdmin = {
  method: Method.POST,
  path: '/groups/nominate/:id',
  summary: 'Propose certain members to be admin',
  tags: ['Group Administrators'],
  request: {
    params:  idParamSchema
  },
  responses: {
    200: {
      description: 'Nomination recorded successfully',
      content:{
        'application/json': {
          schema: messageSchema
        }
      }
    },
    500: {
      description: 'Internal server error.'
    }
  }
};
  
const getProposedGroupAdmins = {
  method: Method.GET,
  path: '/groups/{id}',
  summary: 'Get all proposed admins for a group',
  tags: ['Group Administrators'],
  request: {
    params: idParamSchema
  },
  responses: {
    200: {
      description: 'Admins retriedved successfully.',
      content: {
        'application/json': {
          schema: z.array(nominatedAdminSchema)
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
  
const approveProposedGroupAdmin = {
  method: Method.PATCH,
  path: '/savings/records/{id}',
  summary: 'Approve or disaprove a proposed admin',
  tags: ['Group Administrators'],
  request: {
    params:nominateParamsSchema
  },
  responses: {
    200: {
      description: 'Vote recorded successfully',
    },
    403: {
      description: 'Unprocessable entity'
    },
    500: {
      description: 'Internal server error.'
    }
  }
};
  
registry.registerPath(proposeGroupAdmin);
registry.registerPath(getProposedGroupAdmins);
registry.registerPath(approveProposedGroupAdmin);


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
