import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { WithdrawalRequest,  WithdrawalRequestInterface } from './types';
import { MessageInterface } from '../../globalTypes/index'

const SQL_CREATE_WITHDRAWAL = sql<WithdrawalRequest, Record<string,never>>(`
  WITH can_withdraw AS (
    SELECT 
        g.id AS goal_id, 
        g.name AS goal_name, 
        g.goal_type,
        g.entity_id AS owner_id,
        g.target_at 
        COALESCE(SUM(s.amount),0) AS total_saved
    FROM
       goals g
    LEFT JOIN 
       savings s ON s.goal_id = g.id
    WHERE 
        g.id = :goal_id
        AND g.entity_id = :user_id
        AND (g.goal_type = 'Standard Goal' OR NOW() >= g.target_at)
    GROUP BY 
        g.id, g.name, g.is_locked_goal,g.entity_id
  )
  INSERT INTO withdrawals (goal_id, user_id, amount)
  SELECT c.goal_id :user_id, :amount
  FROM can_withdraw c
  WHERE c.total_saved >= :amount  
  RETURNING c.goal_name;
`);

export default (router: Router) => {
  router.get<Record<string,never>, MessageInterface, WithdrawalRequestInterface, Record<string,never>>(
    '/', 
    authMiddleware(),
    async (req, res) => {
      const { goal_id, amount} = req.body
      const user_id = req.user!.id
      const goal_name= await SQL_CREATE_WITHDRAWAL({ goal_id, user_id, amount }).oneOrNull();
      if (!goal_name){
        throw new HttpError(400, 'There was an error processing your withdrawal request. Please try again later.');
      }
      return res.json({
        message: `Withdrawal of amount KES ${amount.toFixed(2)} from goal ${goal_name} successful!`
      });      
    });
};
`1`