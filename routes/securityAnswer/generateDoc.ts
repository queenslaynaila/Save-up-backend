import { z } from "zod";
import * as yaml from 'yaml';
import * as fs from 'fs';
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { securityAnswerRequestSchema } from '../../types';

extendZodWithOpenApi(z);
const registry = new OpenAPIRegistry();
enum Method {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
}
  
const createSecurityAnswer = {
  method: Method.POST,
  path: '/security-answers',
  summary: 'Create a security answer',
  tags: ['Security Answers'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: securityAnswerRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Security answer created successfully.',
    },
    403: {
      description: ' Unprocessable entity'
    },
    500: {
      description: 'Internal server error.'
    }
  }
};

const updateSecurityAnswer = {
  method: Method.PATCH,
  path: '/security-answers',
  summary: 'Create a security answer',
  tags: ['Security Answers'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: securityAnswerRequestSchema,
        },
      },
      required: true,
    },
    params: z.object({
      id: z.string()
    })
  },
  responses: {
    200: {
      description: 'Answer updated successfully',
    },
    403: {
      description: ' Unprocessable entity'
    },
    500: {
      description: 'Internal server error.'
    }
  }
}

registry.registerPath(createSecurityAnswer);
registry.registerPath(updateSecurityAnswer);


function getOpenApiDocumentation() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  generator.generateComponents();

  return generator.generateDocument({
    info: {
      version: '1.0.0',
      title: 'Security Questions API',
      description: 'API for managing security questions',
    },
    tags: [
      { name: 'Security Answers', description: 'Endpoints for managing security answers' },
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
