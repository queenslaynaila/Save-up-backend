import { z } from "zod";
import * as yaml from 'yaml';
import * as fs from 'fs';
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { securityQuestionSchema } from './types'

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

enum Method {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
}

const initiatePasswordReset = {
  method: Method.POST,
  path: '/pin/forget-password',
  summary: 'Initiate password reset',
  tags: ['Password Management'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            phone_number: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Password reset token generated and sent successfully.',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    403: {
      description: 'Forbidden: Unprocessable entity',
    },
    500: {
      description: 'Internal server error.',
    }
  }
};
  
const verifyPasswordResetToken = {
  method: Method.POST, 
  path: '/pin/verify-reset-token',
  summary: 'Verify password reset token',
  tags: ['Password Management'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            reset_token: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Password reset token verified successfully',
      content: {
        'application/json': {
          schema:securityQuestionSchema,
        },
      },
    },
    403: {
      description: 'Forbidden: Unprocessable entity',
    },
    500: {
      description: 'Internal server error.',
    }
  }
};
  
const resetPassword = {
  method: Method.POST,
  path: '/pin/reset',
  summary: 'Reset password',
  tags: ['Password Management'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            new_password: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Password reset successfully',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    403: {
      description: 'Forbidden: Unprocessable entity',
    },
    500: {
      description: 'Internal server error.',
    }
  }
};
  
const updatePassword = {
  method: Method.PATCH,
  path: '/pin/update-pin',
  summary: 'Update password',
  tags: ['Password Management'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            oldPassword: z.string(),
            newPassword: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Password updated successfully',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    403: {
      description: 'Forbidden: Unprocessable entity',
    },
    500: {
      description: 'Internal server error.'
    }
  }
};
  
registry.registerPath(initiatePasswordReset);
registry.registerPath(verifyPasswordResetToken);
registry.registerPath(resetPassword);
registry.registerPath(updatePassword);

function getOpenApiDocumentation() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  generator.generateComponents();

  return generator.generateDocument({
    info: {
      version: '1.0.0',
      title: 'Password Management API',
      description: 'API for managing passwords',
    },
    tags: [
      { name: 'Password Management', description: 'Endpoints for managing passwords' },
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
