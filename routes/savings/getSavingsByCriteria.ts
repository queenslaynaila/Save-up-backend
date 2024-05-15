import {Response, Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { SavingInterface, SavingParamInterface, SavingsQueryInterface } from './types';
import { idSchema } from '../../globalTypes/index';
 
const SQL_GET_SAVINGS = sql<Record<string,never>, SavingInterface>(`
  SELECT * FROM savings
`);

export default (router: Router) => {
  router.get<string, SavingParamInterface, SavingInterface[], Record<string,never>, SavingsQueryInterface>(
    '/:pockets_identifier', 
    authMiddleware(), 
    async (req, res: Response) => {
      const savingIdentifier = req.params.identifier;
      console.log(savingIdentifier)
      const { category_id, pocket_id } = req.query;
      const filterArgs: Record<string, string> = {};
      const filters: string[] = [];
      const loggedInUserId = req.user!.id;
      const isStandardUser = req.user?.role === 'User';

      if ( savingIdentifier === 'me') {
        filterArgs.loggedInUserId = loggedInUserId.toString()
        filters.push(`user_id = :loggedInUserId`);
      } else if ( savingIdentifier === 'all') {
        if (isStandardUser) {
          throw new HttpError(403, 'Forbidden');
        }
      } else if (idSchema.parse(parseInt( savingIdentifier))) { 
        if (isStandardUser)  {
          throw new HttpError(403, 'Forbidden');
        }
        filterArgs.user_id =  savingIdentifier;
        filters.push(`user_id = :user_id`);
      } else {
        throw new HttpError(400, 'Bad request');
      }

      if (pocket_id) {
        filterArgs.pocket_id = pocket_id.toString();
        filters.push(`pocket_id = :pocket_id`);
      }
      if (category_id) {
        filterArgs.category_id = category_id.toString()
        filters.push(`id IN (SELECT id FROM pockets WHERE category_id = :category_id)`);
      }

      const query = SQL_GET_SAVINGS({});
      if (filters.length > 0) query.extend(`WHERE ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      const savings = await query.many();
      res.json(savings)
    });
};
