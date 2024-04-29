import { z } from "zod";
import * as yaml from 'yaml';
import * as fs from 'fs';
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import {  updateUserPhoneSchema, GetUserSchema  } from './types';
import { messageSchema }  from '../../globalTypes/index';

extendZodWithOpenApi(z);
const registry = new OpenAPIRegistry();
enum Method {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
}
  
const createUser = {
  method: Method.POST,
  path: '/users',
  summary: 'Create a User',
  tags: ['Users'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: messageSchema,
        },
      },
      description: 'Success message on succesful user creation',
    },
  },
  responses: {
    200: {
      description: 'Account created Succesfully.Procced to login.',
    },
    403: {
      description: 'Unprocessable entity',
    },
    500: {
      description: 'Internal server error.',
    }
  }
};
  
const login = {
  method: Method.POST,
  path: '/users/signin',
  summary: 'Login',
  tags: ['Users'],
  request: {
    body: {
      content: {
        'application/json': {
          schema:updateUserPhoneSchema,
        },
      },
    },
  }, 
  responses: {
    200: {
      description: 'Logged in successfully',
      content: {
        'application/json': {
          schema: GetUserSchema
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

const getUserByCriteria = {
  method: Method.GET,
  path: '/users/{targetUser}',
  summary: 'Get a targetUserByVarious Conditions',
  tags: ['Users'],
  request: {
    params: z.object({
      targetUser: z.string()
    })
  },
  responses: {
    200: {
      description: 'User retrieved successfully',
      content: {
        'application/json': {
          schema: GetUserSchema
        }
      }
    },
    500: {
      description: 'Internal server error.'
    }
  }
};


const updateUserPhoneNo = {
  method: Method.PATCH,
  path: '/users/update-phone/{id}',
  summary: 'Update a users phone number',
  tags: ['Users'],
  request: {
    params: z.object({
      id: z.string()
    }),
    body: {
      content: {
        'application/json': {
          schema: updateUserPhoneSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Phone number updated. For continued security, please log in again with your new phone number.',
    },
    403: {
      description: 'Unprocessable entity'
    },
    500: {
      description: 'Internal server error.'
    }
  }
};
  
const logout = {
  method: Method.POST,
  path: '/users/signout',
  summary: 'Get savings by criteria',
  tags: ['Users'],
  responses: {
    200: {
      description: 'Logout successful',
    },
    500: {
      description: 'Internal server error.'
    }
  }
};


registry.registerPath(createUser);
registry.registerPath(login);
registry.registerPath(getUserByCriteria);
registry.registerPath(updateUserPhoneNo);
registry.registerPath(logout);

function getOpenApiDocumentation() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  generator.generateComponents();

  return generator.generateDocument({
    info: {
      version: '1.0.0',
      title: 'SAPI',
      description: 'API for managing users',
    },
    tags: [
      { name: 'Users', description: 'Endpoints for managing users' },
    ],
    openapi: "3.0.0"
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
