import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { CreateSavingInterface, validateSavingCreationSchema } from './types';
import { MessageInterface } from '../../globalTypes/index';

const SQL_CREATE_SAVING = sql<CreateSavingInterface, Record<string,never>>(`
  SELECT create_saving(:entity_id, :user_id, :pocket_id, :amount, )
`);

export default (router: Router) => {
  router.post<Record<string,never>, MessageInterface, CreateSavingInterface, Record<string,never>, Record<string,never>>(
    '/', 
    authMiddleware(), 
    validateRequest(validateSavingCreationSchema),
    async (req, res) => {
      const entity_id = req.body.entity_id ? req.body.entity_id : req.user!.id;
      const user_id= req.user!.id
      await SQL_CREATE_SAVING({ ...req.body, user_id, entity_id})
        .exec();
      res.sendStatus(201);
    });
};