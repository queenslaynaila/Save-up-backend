import { sql } from '../../db';
import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { validateRequest } from '../../middleware/validationMiddleware';
import { CreateGroupInterface,CreateGroupSchema,CreateGroupResponseInterface } from '../../types';

const SQL_CREATE_GROUP = sql<CreateGroupInterface ,CreateGroupResponseInterface>(`
  INSERT INTO groups ( name, description, created_by)
  VALUES(:name, :description, :created_by) 
  RETURNING id;
`);

export default (router: Router) => {
  router.post<Record<string, never>, {message:string},CreateGroupInterface , Record<string, never>, Record<string, never>>(
    '/make_group',
    authMiddleware(),
    validateRequest(CreateGroupSchema),
    async (req, res) => {
      const user_id= req.user!.id
      const { name, description} = req.body;
      await SQL_CREATE_GROUP({ name, description, created_by: user_id }).exec();
      res.json({message:'Group created succesfully'})
    }
  );
};
