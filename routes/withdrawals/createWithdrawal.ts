import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { WithdrawalCreation, withdrawalValidationSchema  } from './types';
import { StatusCodeInterface } from '../../globalTypes/index';

const SQL_CREATE_WITHDRAWAL = sql<WithdrawalCreation, Record<string, never>>(`
  SELECT create_user_withdrawal(:user_id, :pocket_id, :amount);
`); 

export default (router: Router) => {
  router.post<Record<string,never>, StatusCodeInterface, WithdrawalCreation, Record<string,never>>(
    '/', 
    validateRequest(withdrawalValidationSchema),
    authMiddleware(),
    async (req, res) => {
      await SQL_CREATE_WITHDRAWAL({...req.body,user_id:req.user!.id}).exec();
      res.sendStatus(201);   
    });
};
