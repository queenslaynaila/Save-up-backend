import { z } from "zod";
import * as yaml from 'yaml';
import * as fs from 'fs';
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import {  getTopExpenseCategoriesSchema, getTotalExpensesQuerySchema, getTotalExpenseResultSchema, getTotalSavingsResultSchema, totalTargetGoalsQuerySchema,  getTotalTargetsSchema } from '../../types';

extendZodWithOpenApi(z);
const registry = new OpenAPIRegistry();
enum Method {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
}

const getTopExpenseCategories = {
  method: Method.GET,
  path: '/cumulatives/top-expenditure-categories',
  summary: 'Returns an array of categories with the most expenditure in order with their total expenses',
  tags: ['Cumulatives'],
  responses: {
    200: {
      description: ': Categories with highest expenses retrieved successfully.',
      content:{
        'application/json':{
          schema:getTopExpenseCategoriesSchema
        }
      }
    },
    500: {
      description: 'Internal server error.'
    }
  }
};
  
const getTotalUserExpenditure = {
  method: Method.GET,
  path: '/cumulatives/total-expenses:',
  summary: 'Gets total expenses',
  tags: ['Cumulatives'],
  request: {
    params:getTotalExpensesQuerySchema
  },
  responses: {
    200: {
      description: 'Total expenses retrieved successfully',
      content: {
        'application/json': {
          schema: getTotalExpenseResultSchema
        }
      }
    },
    500: {
      description: 'Internal server error.',
    }
  }
};
  
const getTotalUserSavings = {
  method: Method.PATCH,
  path: '/cumulatives/total-savings',
  summary: 'Get individual total savings',
  tags: ['Cumulatives'],
  responses: {
    200: {
      description: 'Saving retrieved successfully',
      content: {
        'application/json': {
          schema: getTotalSavingsResultSchema
        }
      }
    },
    500: {
      description: 'Internal server error.'
    }
  }
};

const getTotalUserTargetGoals = {
  method: Method.PATCH,
  path: '/cumulatives/total-target-amount',
  summary: 'Get a saving by ID',
  tags: ['Cumulatives'],
  request: {
    params: totalTargetGoalsQuerySchema
  },
  responses: {
    200: {
      description: 'Total target amount retrieved successfully.',
      content: {
        'application/json': {
          schema: getTotalTargetsSchema
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
  
registry.registerPath(getTopExpenseCategories);
registry.registerPath(getTotalUserExpenditure);
registry.registerPath(getTotalUserSavings);
registry.registerPath(getTotalUserTargetGoals);

function getOpenApiDocumentation() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  generator.generateComponents();

  return generator.generateDocument({
    info: {
      version: '1.0.0',
      title: 'SAPI',
      description: 'API for managing Culmulatives',
    },
    tags: [
      { name: 'Cumulatives', description: 'Endpoints for managing cumulatives' },
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
