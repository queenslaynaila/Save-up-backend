import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { validateRequest } from '../../middleware/validationMiddleware';
import { TransferInputInterface, TransferDepositResInterface, TransferDepositBodyInterface, transferSchema } from './types'
import { MessageInterface } from '../../globalTypes/index'

const SQL_CREATE_TRANSFER = sql<TransferInputInterface, TransferDepositResInterface>(`
  INSERT INTO transfers (source_goal_id, destination_goal_id, amount, user_id)
  VALUES (:source_goal_id, :destination_goal_id, :amount, :user_id)
  RETURNING 
    (SELECT name FROM goals WHERE id = :source_goal_id) AS source_goal_name, 
    (SELECT name FROM goals WHERE id = :destination_goal_id) AS destination_goal_name;
`);

export default (router: Router) => {
  router.get<Record<string,never>, MessageInterface, TransferDepositBodyInterface, Record<string,never>>(
    '/', 
    authMiddleware(),
    validateRequest(transferSchema),
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
