/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router, Request, Response, NextFunction } from 'express';
import { headersSchema, Method, statusCodeSchema } from '../../globalTypes';
import { z } from 'zod';
import {
  ExpressOpenAPI,
  RequestValidationError,
  ResponseValidationError,
  SpecificationPlugin,
} from 'express-zod-openapi'
import express from 'express'
import { categorySchema } from './types';
import { zodToJsonSchema } from "zod-to-json-schema";
const expressOpenApi = new ExpressOpenAPI()

const specificationPlugin = SpecificationPlugin.create()

const specification = expressOpenApi.registerPlugin(specificationPlugin)

type RouteAnnotation = {
  tag: string;
  method: string;
  path: string;
  description: string;
  request: {
    Headers?:typeof headersSchema;
    params?: z.ZodSchema;
    query?: z.ZodSchema;
    body?: z.ZodSchema;
    response?: z.ZodSchema;
  };
  responses: {
    [status: number]: {
      schema? : typeof statusCodeSchema;
    };
  };
};

function generateDocumentationSchema(annotations: RouteAnnotation[]) {
  return annotations.map(annotation => ({
    tag: annotation.tag,
    method: annotation.method,
    path: annotation.path,
    description: annotation.description,
    request: {
      Headers: annotation.request.Headers ? zodToJsonSchema(annotation.request.Headers) : undefined,
      params: annotation.request.params ? zodToJsonSchema(annotation.request.params) : undefined,
      query: annotation.request.query ? zodToJsonSchema(annotation.request.query) : undefined,
      body: annotation.request.body ? zodToJsonSchema(annotation.request.body) : undefined,
      response: annotation.request.response ? zodToJsonSchema(annotation.request.response) : undefined,
    },
    responses: Object.entries(annotation.responses).reduce((acc, [status, { schema }]) => {
      if (schema) {
        acc[status.toString()] = zodToJsonSchema(schema);
      }
      return acc;
    }, {} as Record<string, Record<string, any>>), 
  }));
}

const routeAnnotations: RouteAnnotation[] = [
  {
    tag: 'Categories',
    method: 'get',
    path: '/api/categories',
    description: 'Get all categories',
    request: {
      Headers: headersSchema,
      response: z.array(statusCodeSchema),
    },
    responses: {
      200: {
        schema: statusCodeSchema,
      },
    },
  },
];

const documentationSchema = generateDocumentationSchema(routeAnnotations);
console.log(JSON.stringify(documentationSchema, null, 2));