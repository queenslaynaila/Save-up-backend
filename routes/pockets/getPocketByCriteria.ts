import { Response, Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { convertToTitleCase, isValidValue } from '../../middleware/caseNormalization';
import { HttpError } from '../../middleware/errorMiddleware';
import { PocketInterface, PocketsConditionsQueryInterface, PocketParam } from './types';

const ACCEPTED_STATUS_VALUES = ['In Progress', 'Dormant', 'Completed'];
const ACCEPTED_PRIORITY_VALUES = ['High', 'Intermediate', 'Low'];

const SQL_GET_POCKETS = sql<Record<string, never>, PocketInterface>(`
  SELECT p.id, p.name, p.entity_id, p.category_id, p.amount, p.priority,
         p.target_at, p.created_at, p.completed_at, p.updated_at, p.pocket_type, 
         ir.rate AS interest_rate
  FROM pockets p
  LEFT JOIN interest_rates ir ON p.pocket_type = ir.type
  WHERE p.deleted_at IS NULL;
`);

export default (router: Router) => {
  router.get<string, PocketParam, PocketInterface[], Record<string,never>, PocketsConditionsQueryInterface>(
    '/:pocketsIdentifier', 
    authMiddleware(), 
    async (req, res: Response) => {
      const { pocketsIdentifier } = req.params;
      const { categoryId, priority, status, startAt, completedAt  } = req.query;

      const filters: string[] = [];
      const filterArgs: Record<string, string> = {};
      const loggedInUserId = req.user!.id;
      const convertedStatus = status ? convertToTitleCase(status) : undefined;
      const convertedPriority = priority ? convertToTitleCase(priority) : undefined;
      const isStandardUser = req.user?.role === 'User';

      if (pocketsIdentifier === 'me') {
        filterArgs.loggedInUserId= loggedInUserId.toString() ;
        filterArgs.isDefaultPocket  = 'FALSE';
        filters.push(`entity_id = :loggedInUserId`);
        filters.push(`is_default_pocket  = :isDefaultPocket`);
      } 
      else if (pocketsIdentifier === 'Default') {
        filterArgs.loggedInUserId= loggedInUserId.toString();
        filterArgs.isDefaultPocket  = 'TRUE';
        filters.push(`entity_id = :loggedInUserId`);
        filters.push(`is_default_pocket  = :isDefaultPocket`);
      } 
      else if (pocketsIdentifier === 'all') {
        if (isStandardUser) {
          throw new HttpError(403, 'Forbidden');
        }
      }
      else if (parseInt(pocketsIdentifier)) { 
        if (isStandardUser)  {
          throw new HttpError(403, 'Forbidden');
        }
        filterArgs.user_id = pocketsIdentifier;
        filters.push(`entity_id = :userId`);
      }
      else {
        throw new HttpError(400, 'Bad request');
      }

      if (categoryId) {
        filterArgs.category_id = categoryId;
        filters.push(`category_id = :categoryId`);
      }

      if (startAt) {
        filterArgs.start_at = startAt;
        filters.push(`start_at = :startAt`);
      }

      if (completedAt) {
        filterArgs.completed_at = completedAt;
        filters.push(`completed_at = :completedAt`);
      }
       
      if (convertedPriority && isValidValue(convertedPriority, ACCEPTED_PRIORITY_VALUES)) {
        filterArgs.priority = convertedPriority;
        filters.push(`priority = :priority`);
      }

      if (convertedStatus && isValidValue(convertedStatus, ACCEPTED_STATUS_VALUES)) {
        filterArgs.status = convertedStatus;
        filters.push(`status = :status`);
      }

      const query = SQL_GET_POCKETS({});
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      res.json(await query.many());
    });
};
