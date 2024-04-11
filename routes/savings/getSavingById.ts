import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';
import { SavingInterface } from '../../types';
import { sql } from '../../db';

const  SQL_GET_SAVING_BY_ID = sql<{ id: number}, SavingInterface>(
  `SELECT * FROM savings WHERE id = :id `
);

export default (router: Router) => {
  router.get<{ id: string }, SavingInterface, Record<string, never>, Record<string, never>>(
    '/records/:id', 
    authMiddleware(), 
    async (req, res) => {
      const contributionsId = parseInt(req.params.id);
      const result = await SQL_GET_SAVING_BY_ID({ id: contributionsId })
        .one(new HttpError(404, 'Not found'));
      return res.json(result);
    });
};
