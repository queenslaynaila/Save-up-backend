import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { WithdrawalRequest,  WithdrawalRequestInterface } from './types';
import { MessageInterface } from '../../globalTypes/index';

const SQL_CREATE_WITHDRAWAL = sql<WithdrawalRequest, Record<string, never>>(`
  INSERT INTO withdrawals (pocket_id, id, user_id, entity_id, amount)
  SELECT 
    :pocket_id, 
    COALESCE((SELECT MAX(id) + 1 FROM withdrawals WHERE pocket_id = :pocket_id), 1), 
    :user_id, 
    :entity_id,
    :amount
  FROM (
    SELECT cumulative_amount
    FROM transaction_logs
    WHERE pocket_id = :pocket_id
    ORDER BY created_at DESC
    LIMIT 1
  ) AS t
  CROSS JOIN (
    SELECT pocket_type, target_at, name
    FROM pockets
    WHERE id = :pocket_id
  ) AS p
  WHERE 
    (
      p.pocket_type = 'Standard Pocket' 
      AND t.cumulative_amount >= :amount
    )
    OR (
      p.pocket_type = 'Locked Pocket' 
      AND t.cumulative_amount >= :amount 
      AND p.target_at <= NOW()
    )
  RETURNING *;

`); 

export default (router: Router) => {
  router.post<Record<string,never>, MessageInterface, WithdrawalRequestInterface, Record<string,never>>(
    '/', 
    authMiddleware(),
    async (req, res) => {
      const { pocket_id, amount} = req.body
      const user_id = req.user!.id
      await SQL_CREATE_WITHDRAWAL({ pocket_id, user_id, amount, entity_id: user_id }).one(
        new HttpError(400, `Insufficient funds to make withdrawal of ${amount.toFixed(2)}` )
      );
      return res.json({
        message: `Withdrawal of amount KES ${amount.toFixed(2)} successful!`
      });     
    });
};
`1`