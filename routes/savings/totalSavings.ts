import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import {  Totals } from './types';
import { GetByUserInterface } from '../../globalTypes';

const  SQL_GET_TOTAL_SAVINGS = sql<GetByUserInterface, Totals>(`
  SELECT 
    SUM(delta) AS total_savings
  FROM 
    transactions
  WHERE 
    entity_id = :user_id
    AND type_id = 1;
`);

export default (router: Router) => {
  router.get<Record<string,never>, Totals, Record<string,never>, 
  Record<string,never>>(
    '/totals', 
    authMiddleware(), 
    async (req, res) => {
      const result = await SQL_GET_TOTAL_SAVINGS({ 
        user_id:req.user!.id
      }).one(new HttpError(404));
      return res.json(result);
    });
};