import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { DepositInterface } from './types';
import { IdParamInterface } from '../../globalTypes/index';

const  SQL_GET_DEPOSIT_BY_ID = sql<{ id: number; user_id:number}, DepositInterface>(`
  SELECT * FROM savings WHERE id = :id AND user_id = :user_id
`);

export default (router: Router) => {
  router.get<IdParamInterface, DepositInterface, Record<string,never>, Record<string,never>>(
    '/records/:id', 
    authMiddleware(), 
    async (req, res) => {
      const contributionsId = parseInt(req.params.id);
      const user_id= req.user!.id
      const result = await SQL_GET_DEPOSIT_BY_ID({ id: contributionsId,user_id })
        .one(new HttpError(404, 'Not found'));
      return res.json(result);
    });
};
 