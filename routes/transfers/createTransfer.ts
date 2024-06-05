import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { TransferInputInterface, TransferDepositResInterface, TransferDepositBodyInterface, transferDepositBody  } from './types'
import { StatusCodeInterface } from '../../globalTypes/index'

const SQL_CREATE_TRANSFER = sql<TransferInputInterface, TransferDepositResInterface>(`
  INSERT INTO transfers (id, source_pocket_id, destination_pocket_id, amount, user_id)
  SELECT 
      COALESCE(MAX(id), 0) + 1,
      :source_pocket_id,
      :destination_pocket_id,
      :amount,
      :user_id
  FROM transfers
  WHERE user_id = :user_id;
`);

export default (router: Router) => {
  router.post<Record<string,never>, StatusCodeInterface, TransferDepositBodyInterface, Record<string,never>>(
    '/', 
    authMiddleware(),
    validateRequest(transferDepositBody),
    async (req, res) => {
      await SQL_CREATE_TRANSFER({  ...req.body, user_id:req.user!.id }).exec();
      res.sendStatus(201);
    });
};