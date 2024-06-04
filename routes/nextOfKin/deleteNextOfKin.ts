import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { DeleteNextOfKinInterface } from './types';
import { IdParamInterface, MessageInterface } from '../../globalTypes/index';

const SQL_DELETE_KIN = sql<DeleteNextOfKinInterface, Record<string,never>>(`
  UPDATE next_of_kins  
  SET deleted_at = NOW()
  WHERE user_id = :user_id
  AND xid = :xid
  AND deleted_at IS NULL
`);

export default (router: Router) => {   
  router.delete<IdParamInterface, MessageInterface, Record<string,never>, Record<string,never>>(
    '/:id', 
    authMiddleware(), 
    async (req, res) => {
      const user_id = req.user!.id;
      const xid = parseInt(req.params.id);
      await SQL_DELETE_KIN({user_id, xid }).exec();
      res.sendStatus(201);
    }
  );
};
