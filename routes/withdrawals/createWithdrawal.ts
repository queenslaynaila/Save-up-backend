import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { WithdrawalCreation, withdrawalValidationSchema  } from './types';
import { StatusCodeInterface } from '../../globalTypes/index';

const SQL_CREATE_WITHDRAWAL = sql<WithdrawalCreation, Record<string, never>>(`
  SELECT create_withdrawal(:entity_id, :pocket_id, :user_id, :amount);
`); 

export default (router: Router) => {
  router.post<Record<string,never>, StatusCodeInterface, WithdrawalCreation, Record<string,never>>(
    '/', 
    validateRequest(withdrawalValidationSchema),
    authMiddleware(),
    async (req, res) => {
      const user_id = req.user!.id
      await SQL_CREATE_WITHDRAWAL({...req.body, entity_id: user_id, user_id }).exec();
      res.sendStatus(201);   
    });
};
