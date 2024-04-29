import { Router } from 'express';
import { sql } from '../../db';
//import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { DepositInterface, DepositParamInterface, DepositsQueryInterface } from './types';
import { idSchema } from '../../globalTypes/index';
 
const SQL_GET_DEPOSITS = sql<Record<string,never>, DepositInterface>(`
  SELECT * FROM deposits
`);

export default (router: Router) => {
  router.get<string, DepositParamInterface, DepositInterface[], Record<string, never>, DepositsQueryInterface>(
    '/:identifier',
    async (req, res) => {
      const depositIdentifier = req.params.identifier;
      const { categoryId, pocketId } = req.query;
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
        filters.push(`user_id = :userId`);
      } else {
        throw new HttpError(400, 'Bad request');
      }

      if (pocketId) {
        filterArgs.pocketId = pocketId.toString();
        filters.push(`pocket_id = :pocketId`);
      }
      if (categoryId) {
        filterArgs.categoryId = categoryId.toString()
        filters.push(`deposit_id IN (SELECT id FROM pockets WHERE category_id = :categoryId)`);
      }

      const query = SQL_GET_DEPOSITS({});
      if (filters.length > 0) query.extend(`WHERE ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      const deposits = await query.many();
      res.json(deposits)
    }
  )};