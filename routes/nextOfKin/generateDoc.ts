import { z } from "zod";
import * as yaml from 'yaml';
import * as fs from 'fs';
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { NextOfKinSchema, nextOfKinCreationSchema, updateNextOfKinSchema } from './types';
import { Method } from '../../globalTypes';

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

const createNextOfKin = {
  method: Method.POST,
  path: '/next-of-kin',
  summary: 'Create a next of kin',
  tags: ['Next of Kin Management'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: nextOfKinCreationSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Next of kin created successfully.',
      content: {
        'application/json': {
          schema: NextOfKinSchema,
        },
      },
    },
    400: {
      description: 'You already have an existing next of kin. Please update it',
    },
    403: {
      description: 'Forbidden: Unprocessable entity',
    },
    500: {
      description: 'Internal server error.',
    }
  }
};

const deleteNextOfKin = {
  method: Method.PATCH,
  path: '/next-of-kin/record/{id}',
  summary: 'Soft delete a next of kin',
  tags: ['Next of Kin Management'],
  request: {
    params: z.object({
      id: z.string()
    })
  },
  responses: {
    200: {
      description: 'Next of kin deleted successfully',
    },
    403: {
      description: 'Forbidden: Unprocessable entity',
    },
    500: {
      description: 'Internal server error.',
    }
  }
};

const getNextOfKin = {
  method: Method.GET,
  path: '/next-of-kin/',
  summary: 'Get next of kin details',
  tags: ['Next of Kin Management'],
  responses: {
    200: {
      description: 'Next of kin details retrieved successfully',
      content: {
        'application/json': {
          schema:NextOfKinSchema,
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

const updateNextOfKin = {
  method: Method.PATCH,
  path: '/next-of-kin/',
  summary: 'Update next of kin details',
  tags: ['Next of Kin Management'],
  request: {
    body: {
      content: {
        'application/json': {
          schema:updateNextOfKinSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Next of kin details updated successfully',
      content: {
        'application/json': {
          schema:NextOfKinSchema,
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

registry.registerPath(createNextOfKin);
registry.registerPath(deleteNextOfKin);
registry.registerPath(getNextOfKin);
registry.registerPath(updateNextOfKin);

function getOpenApiDocumentation() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  generator.generateComponents();

  return generator.generateDocument({
    info: {
      version: '1.0.0',
      title: 'Next of Kin Management API',
      description: 'API for managing next of kin',
    },
    tags: [
      { name: 'Next of Kin Management', description: 'Endpoints for managing next of kin' },
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
