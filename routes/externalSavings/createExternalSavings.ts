import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';

const SQL_CREATE_EXTERNAL_SAVINGS = sql<{group_id:number,goal_id:number,amount:number,contributer:string,phone_number:string}, {goal_name:string}>(`
  INSERT INTO external_savings (group_id, goal_id, contributor, phone_number, amount)
  VALUES (:group_id, :goal_id, :contributer, :phone_number, :amount)
  RETURNING 
      g.name AS goal_name
  FROM external_savings es
  JOIN goals g ON es.goal_id = g.id;
`);

export default (router: Router) => {
  router.get<Record<string,never>,{message: string} ,{group_id:number,goal_id:number,amount:number,contributer:string,phone_number:string}, Record<string,never>>(
    '/', 
    authMiddleware(),
    async (req, res) => {
      const { group_id,goal_id,amount,contributer,phone_number } = req.body
      const external_savings = await SQL_CREATE_EXTERNAL_SAVINGS({ group_id,goal_id,amount,contributer,phone_number }).oneOrNull();
      if (!external_savings){
        throw new HttpError(400, 'There was an error processing your request. Please try again later.');
      }
      return res.json({
        message: `Deposit of amount KES ${amount.toFixed(2)} to ${external_savings.goal_name} successful!`
      });      
    });
};
