import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import {  Balance } from './types';
import { GetByUserInterface } from '../../globalTypes';

//current balance across all pockets
const  SQL_GET_AVAILABLE_SAVINGS = sql<GetByUserInterface, Balance>(`
  SELECT delta AS available_balance
  FROM transactions
  WHERE entity_id = :user_id
  ORDER BY created_at DESC
  LIMIT 1;
`);

export default (router: Router) => {
  router.get<Record<string,never>, Balance, Record<string,never>, 
  Record<string,never>>(
    '/available-savings', 
    authMiddleware(), 
    async (req, res) => {
      const result = await SQL_GET_AVAILABLE_SAVINGS({ 
        user_id:req.user!.id
      }).one(new HttpError(404));
      return res.json(result);
    });
};