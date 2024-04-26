import { z } from "zod";
import * as yaml from 'yaml';
import * as fs from 'fs';
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { createExpenseSchemaValidation, expenseSchema, expenseIdSchema, expenseIdentifierSchema, expenseQuerySchema, deleteExpenseSchema, validateUpdateExpenseSchema} from './types';
import { Method, messageSchema, idParamSchema } from '../../globalTypes';

extendZodWithOpenApi(z);
const registry = new OpenAPIRegistry();

const createExpense = {
  method: Method.POST,
  path: '/expenses',
  summary: 'Invite a user to a certain group',
  tags: ['Expenses'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createExpenseSchemaValidation
        },
      },
    }
  },
  responses: {
    200: {
      description: 'Expense created succesfully',
      content: {
        'application/json': {
          schema: expenseSchema.openapi('Expenses'),
        }
      }
    },
    500: {
      description: 'Internal server error.'
    }
  }
};
  
const getExpenseById = {
  method: Method.GET,
  path: '/expenses/records/{expenseId}',
  summary: 'Get an expense by Id',
  tags: ['Expenses'],
  request:{
    params:expenseIdSchema
  },
  responses: {
    200: {
      description: 'Expense Updated successfully.',
      content: {
        'application/json': {
          schema: expenseSchema
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

const getExpensesByCriteria = {
  method: Method.GET,
  path: '/expenses/{expensesIdentifier}',
  summary: 'Get expenses by criteria',
  tags: ['Expenses'],
  request: {
    params: expenseIdentifierSchema,
    query:expenseQuerySchema
  },
  responses: {
    200: {
      description: 'Expenses retrieved successfully',
      content: {
        'application/json': {
          schema: z.array(expenseSchema)
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

const updateExpenses = {
  method: Method.PATCH,
  path: '/expenses/{id}',
  summary: 'Update a expenses by Id',
  tags: ['Expenses'],
  request: {
    params:idParamSchema
  },
  responses: {
    200: {
      description: 'Expense Updated successfully',
      content: {
        'application/json': {
          schema:validateUpdateExpenseSchema
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

const deleteExpenses = {
  method: Method.PATCH,
  path: '/records/{id}',
  summary: 'Soft deletes an expense',
  tags: ['Expenses'],
  request: {
    params:idParamSchema,
    body:{
      content:{
        'application/json':{
          schema:deleteExpenseSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Expenses deleted successfully',
      content: {
        'application/json': {
          schema:messageSchema
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
  
registry.registerPath(createExpense);
registry.registerPath(getExpenseById);
registry.registerPath(getExpensesByCriteria);
registry.registerPath(updateExpenses);
registry.registerPath(deleteExpenses);

function getOpenApiDocumentation() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  generator.generateComponents();

  return generator.generateDocument({
    info: {
      version: '1.0.0',
      title: 'SAPI',
      description: 'API for managing expenses',
    },
    tags: [
      { name: 'Expenses', description: 'Endpoints for managing expenses' },
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
