import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';


const SQL_CREATE_TRANSFER = sql<{ user_id: number; source_goal_id: number; destination_goal_id: number; amount: number}, {source_goal_name: string; destination_goal_name: string}>(`
  INSERT INTO transfers (source_goal_id, destination_goal_id, amount, user_id)
  SELECT 
      :source_goal_id, 
      :destination_goal_id,
      :amount, 
      :user_id
  FROM transfers AS t
  INNER JOIN 
        goals AS sg ON sg.id = t.source_goal_id
  INNER JOIN 
        goals AS dg ON dg.id = t.destination_goal_id
  WHERE 
      sg.is_default_vault = TRUE
      AND sg.entity_id = :user_id
  RETURNING 
      sg.name AS source_goal_name, 
      dg.name AS destination_goal_name;
`);

export default (router: Router) => {
  router.get<Record<string,never>,{message: string} ,{ source_goal_id: number; destination_goal_id: number; user_id: number; amount: number}, Record<string,never>>(
    '/', 
    authMiddleware(),
    async (req, res) => {
      const { source_goal_id, destination_goal_id, amount } = req.body
      const user_id = req.user!.id
      const transfer = await SQL_CREATE_TRANSFER({source_goal_id, destination_goal_id, amount, user_id}).oneOrNull();
      if (!transfer){
        throw new HttpError(400, 'There was an error processing your transfer request. Please try again later.');
      }
      return res.json({
        message: `Trasfer of amount KES ${amount.toFixed(2)} from goal ${transfer.source_goal_name} to goal ${transfer.destination_goal_name} successful!`
      });      
    });
};
