import { z } from "zod";
import * as yaml from 'yaml';
import * as fs from 'fs';
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import {  createCategorySchema, categorySchema, categoriesArraySchema, idParamSchema, Method} from '../../types';

extendZodWithOpenApi(z);
const registry = new OpenAPIRegistry();
  
const createCategory = {
  method: Method.POST,
  path: '/categories',
  summary: 'Create a new category.Accesable to admins only',
  tags: ['Categories'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createCategorySchema
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Category created successfully',
      content: {
        'application/json': {
          schema: categorySchema.openapi('Category')
        }
      }},
    401: {
      description:'Access Denied.Log in.'
    },
    500: {
      description: 'Internal server error.'
    }
  }
};
  
const getAllCategories = {
  method: Method.GET,
  path: '/categories',
  summary: 'Returns an array of all categories object',
  tags: ['Categories'],
  responses: {
    200: {
      description: 'Categories retrieved successfully',
      content: {
        'application/json': {
          schema: categoriesArraySchema
        }
      }
    },
    401: {
      description:'Access Denied.Log in.'
    },
    500: {
      description: 'Internal server error.'
    }
  }
};

const updateCategory = {
  method: Method.PATCH,
  path: '/categories/{id}',
  summary: 'Update a category.Specific to only admins',
  tags: ['Categories'],
  request: {
    params:idParamSchema,
  },
  responses: {
    200: {
      description: 'Category updated successfully',
      content: {
        'application/json': {
          schema: categorySchema
        }
      }
    },
    401: {
      description:'Access Denied.Log in.'
    },
    404: {
      description: 'Not found'
    },
    500: {
      description: 'Internal server error.'
    }
  }
};

const deleteCategory = {
  method: Method.PATCH,
  path: '/categories/records/{id}',
  summary: 'Soft deletes a category',
  tags: ['Categories'],
  request: {
    params: idParamSchema
  },
  responses: {
    200: {
      description: 'Category deleted successfully.Specific to only admins',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string()
          })
        }
      }
    },
    401: {
      description:'Access Denied.Log in.'
    },
    404: {
      description: 'Not found',
    },
    500: {
      description: 'Internal server error.',
    }
  }
};
  
registry.registerPath(createCategory);
registry.registerPath(getAllCategories);
registry.registerPath(updateCategory);
registry.registerPath(deleteCategory);

function getOpenApiDocumentation() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  generator.generateComponents();

  return generator.generateDocument({
    info: {
      version: '1.0.0',
      title: 'CATEGORIES API',
      description: 'API for managing categories',
    },
    tags: [
      { name: 'Categories', description: 'Endpoints for managing categories' },
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
