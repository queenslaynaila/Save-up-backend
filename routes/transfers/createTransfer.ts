import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import validateRequest from '../../middleware/validationMiddleware';
import {
  TransferInput,
  TransferValidation,
  transferValidationSchema
} from './types';
import { StatusCodeInterface } from '../../globalTypes';
import { HttpError } from '../../middleware/errorMiddleware';

const SQL_CREATE_TRANSFER = sql<TransferInput, Record<string, never>>(`
  SELECT create_transfer(
    :source_pocket_id, 
    :destination_pocket_id, 
    :user_id, 
    :amount, 
    :entity_id
  )
`);

export default (router: Router) => {
  router.post<Record<string, never>, StatusCodeInterface, TransferValidation,
  Record<string, never>>(
    '/',
    validateRequest({
      body: transferValidationSchema
    }),
    authMiddleware(),
    async (req, res) => {
      const entity_id = req.body.entity_id ?? req.user!.id;
      await SQL_CREATE_TRANSFER({
        ...req.body, entity_id, user_id: req.user!.id
      }).exec().catch((err) => {
        if (err.code === 'P0004') {
          throw new HttpError(400, { message: 'ERR_INSUFFICIENT_FUNDS' });
        }
      });
      res.sendStatus(201);
    }
  );
};