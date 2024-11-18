import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import {
  GroupCreationInterface,
  groupCreationValidation,
  BaseGroupInterface,
  baseGroupSchema
} from './types';
import { z } from 'zod';

const SQL_CREATE_GROUP = sql<GroupCreationInterface, BaseGroupInterface>(`
    SELECT * FROM create_group(:name, :created_by )
`);

const createGroup = (router:Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Create a group',
    schema: {
      params: z.object({
        id: z.string()
      }),
      body: groupCreationValidation
    },
    response: {
      schema: baseGroupSchema,
      statusCode: 201
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const group = await SQL_CREATE_GROUP({
        ...req.body,
        created_by: req.user!.id
      }).one();
      res.json(group);
    }
  });
};

export default createGroup;