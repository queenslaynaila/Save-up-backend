import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { WithdrawalRequest,  WithdrawalRequestInterface } from './types';
import { MessageInterface } from '../../globalTypes/index'

const SQL_CREATE_WITHDRAWAL = sql<WithdrawalRequest, Record<string,never>>(`
  WITH can_withdraw AS (
    SELECT 
        p.id AS pocket_id, 
        p.name AS pocket_name, 
        p.pocket_type,
        p.entity_id AS owner_id,
        p.target_at,
        COALESCE(SUM(s.amount),0) AS total_saved
    FROM
       pockets p
    LEFT JOIN 
       deposits d ON d.pocket_id = p.id
    WHERE 
        p.id = :pocketId
        AND p.entity_id = :userId
        AND (p.pocket_type = 'Standard Pocket' OR NOW() >= p.target_at)
    GROUP BY 
        p.id, g.name, p.is_locked_pocket,p.entity_id
  )
  INSERT INTO withdrawals (pocket_id, user_id, amount)
  SELECT c.pocketId :userId, :amount
  FROM can_withdraw c
  WHERE c.total_saved >= :amount  
  RETURNING c.pocket_name;
`);

export default (router: Router) => {
  router.get<Record<string,never>, MessageInterface, WithdrawalRequestInterface, Record<string,never>>(
    '/', 
    authMiddleware(),
    async (req, res) => {
      const { pocket_id, amount} = req.body
      const user_id = req.user!.id
      const pocket_name= await SQL_CREATE_WITHDRAWAL({ pocket_id, user_id, amount }).oneOrNull();
      if (!pocket_name){
        throw new HttpError(400, 'There was an error processing your withdrawal request. Please try again later.');
      }
      return res.json({
        message: `Withdrawal of amount KES ${amount.toFixed(2)} from pocket ${pocket_name} successful!`
      });      
    });
};
`1`