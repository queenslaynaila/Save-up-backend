import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { TransferInputInterface, transferSchema } from './types'
import { StatusCodeInterface } from '../../globalTypes/index'

const SQL_CREATE_TRANSFER = sql<TransferInputInterface, Record<string,never>>(`
  INSERT INTO transfers (entity_id, xid, user_id, source_pocket_id, destination_pocket_id, amount)
  SELECT 
      :entity_id,
      COALESCE(MAX(id), 0) + 1,
      :user_id,
      :source_pocket_id,
      :destination_pocket_id,
      :amount
  FROM transfers
  WHERE entity_id = :entity_id;
`);

export default (router: Router) => {
  router.post<Record<string,never>, StatusCodeInterface, TransferInputInterface, Record<string,never>>(
    '/', 
    authMiddleware(),
    validateRequest(transferSchema),
    async (req, res) => {
      const entity_id = req.body.entity_id ?? req.user!.id;
      await SQL_CREATE_TRANSFER({  ...req.body, entity_id, user_id: req.user!.id}).exec();
      res.sendStatus(201);
    });
};