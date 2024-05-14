import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { WithdrawalRequest,  WithdrawalRequestInterface } from './types';
import { MessageInterface } from '../../globalTypes/index';

const SQL_CREATE_WITHDRAWAL = sql<WithdrawalRequest, Record<string, never>>(`
  SELECT withdraw_savings(:pocket_id, :user_id, :amount, :entity_id);
`); 

export default (router: Router) => {
  router.post<Record<string,never>, MessageInterface, WithdrawalRequestInterface, Record<string,never>>(
    '/', 
    authMiddleware(),
    async (req, res) => {
      const { pocket_id, amount} = req.body
      const user_id = req.user!.id
      await SQL_CREATE_WITHDRAWAL({ pocket_id, user_id, amount, entity_id: user_id }).one(
        new HttpError(400, `Insufficient funds to make withdrawal of ${amount.toFixed(2)} or target date not met for withdrawal.` )
      );
      return res.json({
        message: `Withdrawal of amount KES ${amount.toFixed(2)} successful!`
      });     
    });
};
