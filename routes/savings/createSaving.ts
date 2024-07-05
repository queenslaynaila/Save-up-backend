import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { SavingCreateType ,  savingPostRequestSchema } from './types';
import { StatusCodeInterface } from '../../globalTypes/index';

const SQL_CREATE_SAVING = sql<SavingCreateType, Record<string,never>>(`
  SELECT create_saving(:user_id, :pocket_id, :amount)
`);

export default (router: Router) => {
  router.post<Record<string,never>, StatusCodeInterface, SavingCreateType, 
  Record<string,never>>(
    '/', 
    authMiddleware(), 
    validateRequest(savingPostRequestSchema),
    async (req, res) => {
      await SQL_CREATE_SAVING({
        ...req.body, user_id:req.user!.id
      }).exec();
      res.sendStatus(201);
    });
};