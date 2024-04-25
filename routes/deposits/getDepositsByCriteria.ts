import { Router } from 'express';
import { sql } from '../../db';
//import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { DepositInterface, DepositParamInterface, DepositsQueryInterface } from './types';
import { idSchema } from '../../types';
 
const SQL_GET_DEPOSITS = sql<Record<string,never>, DepositInterface>(`
  SELECT * FROM deposits
`);

export default (router: Router) => {
  router.get<string, DepositParamInterface, DepositInterface[], Record<string, never>, DepositsQueryInterface>(
    '/:identifier',
    async (req, res) => {
      const depositIdentifier = req.params.identifier;
      const { category_id, goal_id } = req.query;
      const filterArgs: Record<string, string> = {};
      const filters: string[] = [];
      const loggedInUserId = req.user!.id;
      const isStandardUser = req.user?.role === 'User';

      if ( depositIdentifier === 'me') {
        filterArgs.loggedInUserId = loggedInUserId.toString()
        filters.push(`user_id = :loggedInUserId`);
      } else if ( depositIdentifier === 'all') {
        if (isStandardUser) {
          throw new HttpError(403, 'Forbidden');
        }
      } else if (idSchema.parse(parseInt( depositIdentifier))) { 
        if (isStandardUser)  {
          throw new HttpError(403, 'Forbidden');
        }
        filterArgs.user_id =  depositIdentifier;
        filters.push(`user_id = :user_id`);
      } else {
        throw new HttpError(400, 'Bad request');
      }

      if (goal_id) {
        filterArgs.goal_id = goal_id.toString();
        filters.push(`goal_id = :goal_id`);
      }
      if (category_id) {
        filterArgs.category_id = category_id.toString()
        filters.push(`deposit_id IN (SELECT id FROM goals WHERE category_id = :category_id)`);
      }

      const query = SQL_GET_DEPOSITS({});
      if (filters.length > 0) query.extend(`WHERE ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      const deposits = await query.many();
      res.json(deposits)
    }
  )};