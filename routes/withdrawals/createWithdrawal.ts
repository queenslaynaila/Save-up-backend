import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import validateRequest from '../../middleware/validationMiddleware';
import { WithdrawalBody, 
  withdrawalBodySchema, 
  WithdrawalCreation 
} from './types';
import { headersSchema, StatusCodeInterface } from '../../globalTypes/index';

const SQL_CREATE_WITHDRAWAL = sql<WithdrawalCreation, Record<string, never>>(`
  SELECT create_user_withdrawal(:user_id, :pocket_id, :amount);
`); 

export default (router: Router) => {
  router.post<Record<string,never>, StatusCodeInterface, WithdrawalBody, 
  Record<string,never>>(
    '/', 
    validateRequest({ headers: headersSchema, body:withdrawalBodySchema }),
    authMiddleware(),
    async (req, res) => {
      await SQL_CREATE_WITHDRAWAL({
        ...req.body,user_id:req.user!.id
      }).exec();
      res.sendStatus(201);   
    });
};
