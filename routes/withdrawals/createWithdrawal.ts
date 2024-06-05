import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { WithdrawalRequest,  WithdrawalRequestInterface } from './types';
import { StatusCodeInterface } from '../../globalTypes/index';

const SQL_CREATE_WITHDRAWAL = sql<WithdrawalRequest, Record<string, never>>(`
  SELECT withdraw_savings(:entity_id, :pocket_id, :user_id, :amount);
`); 

export default (router: Router) => {
  router.post<Record<string,never>, StatusCodeInterface, WithdrawalRequestInterface, Record<string,never>>(
    '/', 
    authMiddleware(),
    async (req, res) => {
      const user_id = req.user!.id
      await SQL_CREATE_WITHDRAWAL({...req.body, entity_id: user_id, user_id }).exec();
      res.sendStatus(201);   
    });
};
