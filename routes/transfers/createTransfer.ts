import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { TransferInput ,  transferValidationSchema } from './types'
import { StatusCodeInterface } from '../../globalTypes/index'

const SQL_CREATE_TRANSFER = sql<TransferInput , Record<string,never>>(`
  SELECT create_transfer(
    :source_pocket_id, 
    :destination_pocket_id, 
    :user_id, 
    :amount, 
    :entity_id
  )
`);

export default (router: Router) => {
  router.post<Record<string,never>, StatusCodeInterface, TransferInput, 
  Record<string,never>>(
    '/', 
    authMiddleware(),
    validateRequest( transferValidationSchema),
    async (req, res) => {
      const entity_id = req.body.entity_id ?? req.user!.id;
      await SQL_CREATE_TRANSFER({  
        ...req.body, entity_id, user_id: req.user!.id
      }).exec();
      res.sendStatus(201);
    });
};