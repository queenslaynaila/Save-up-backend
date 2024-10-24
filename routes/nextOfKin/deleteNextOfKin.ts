import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { NextOfKinDeletionInterface } from './types';
import {
  IdParamInterface,
  idParamSchema,
  StatusCodeInterface
} from '../../globalTypes';
import validateRequest from '../../middleware/validationMiddleware';

const SQL_DELETE_KIN = sql<NextOfKinDeletionInterface, Record<string, never>>(`
  UPDATE next_of_kins  
  SET deleted_at = NOW()
  WHERE user_id = :user_id
  AND xid = :xid
  AND deleted_at IS NULL
`);

export default (router: Router) => {
  router.delete<IdParamInterface, StatusCodeInterface, Record<string, never>,
  Record<string, never>>(
    '/:id',
    validateRequest({
      params: idParamSchema
    }),
    authMiddleware(),
    async (req, res) => {
      await SQL_DELETE_KIN({
        user_id: req.user!.id,
        xid: Number(req.params.id)
      }).exec();
      res.sendStatus(204);
    }
  );
};