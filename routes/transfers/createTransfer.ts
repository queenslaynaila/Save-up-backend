import { Router } from 'express';
import { sql } from '../../db';
//import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { validateRequest } from '../../middleware/validationMiddleware';
import { TransferInputInterface, TransferDepositResInterface, TransferDepositBodyInterface, transferDepositBody  } from './types'
import { MessageInterface } from '../../globalTypes/index'

const SQL_CREATE_TRANSFER = sql<TransferInputInterface, TransferDepositResInterface>(`
INSERT INTO transfers (id, source_pocket_id, destination_pocket_id, amount, user_id)
VALUES (  (SELECT COALESCE(MAX(id), 0) + 1 FROM transfers WHERE user_id = :user_id),
          :source_pocket_id, :destination_pocket_id, :amount, :user_id
        )
RETURNING 
    (SELECT name FROM pockets WHERE id = :source_pocket_id) AS source_pocket_name,
    (SELECT name FROM pockets WHERE id = :destination_pocket_id) AS destination_pocket_name;
`);

export default (router: Router) => {
  router.post<Record<string,never>, MessageInterface, TransferDepositBodyInterface, Record<string,never>>(
    '/', 

    validateRequest(transferDepositBody),
    async (req, res) => {
      const { source_pocket_id, destination_pocket_id, amount } = req.body
      const user_id = 3
      const transfer = await SQL_CREATE_TRANSFER({ source_pocket_id, destination_pocket_id, amount, user_id }).oneOrNull();
      if (!transfer){
        throw new HttpError(400, 'There was an error processing your transfer request. Please try again later.');
      }
      return res.json({
        message: `Trasfer of amount KES ${amount.toFixed(2)} from pocket ${transfer.source_pocket_name} to pocket ${transfer.destination_pocket_name} successful!`
      });      
    });
};
 