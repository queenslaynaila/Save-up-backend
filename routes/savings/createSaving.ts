import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import validateRequest from '../../middleware/validationMiddleware';
import { 
  SavingCreateType,  
  savingPostRequestSchema, 
  SavingPostRequestType 
} from './types';
import { headersSchema, StatusCodeInterface } from '../../globalTypes/index';

const SQL_CREATE_SAVING = sql<SavingCreateType, Record<string,never>>(`
  SELECT create_saving(:user_id, :pocket_id, :amount)
`);

export default (router: Router) => {
  router.post<Record<string,never>, StatusCodeInterface, SavingPostRequestType, 
  Record<string,never>>(
    '/', 
    validateRequest({ headers: headersSchema, body:savingPostRequestSchema }),
    authMiddleware(), 
    async (req, res) => {
      await SQL_CREATE_SAVING({
        ...req.body, user_id:req.user!.id
      }).exec();
      res.sendStatus(201);
    });
};