import { Response, Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { convertToTitleCase, isValidValue } from '../../middleware/caseNormalization';
import { HttpError } from '../../middleware/errorMiddleware';
import { GoalInterface, GoalsConditionsQueryInterface, GoalParam } from './types';

const ACCEPTED_STATUS_VALUES = ['In Progress', 'Dormant', 'Completed'];
const ACCEPTED_PRIORITY_VALUES = ['High', 'Intermediate', 'Low'];

const SQL_GET_POCKETS = sql<Record<string, never>, GoalInterface>(`
  SELECT p.id, p.name, p.entity_id, p.category_id, p.amount, p.priority,
         p.target_at, p.created_at, p.completed_at, p.updated_at, p.pocket_type, 
         ir.rate AS interest_rate
  FROM pockets p
  LEFT JOIN interest_rates ir ON p.pocket_type = ir.type
  WHERE p.deleted_at IS NULL;
`);

export default (router: Router) => {
  router.get<string, GoalParam, GoalInterface[], Record<string,never>, GoalsConditionsQueryInterface>(
    '/:pocketsIdentifier', 
    authMiddleware(), 
    async (req, res: Response) => {
      const { pocketsIdentifier } = req.params;
      const { category_id, priority, status,start_at, completed_at  } = req.query;

      const filters: string[] = [];
      const filterArgs: Record<string, string> = {};
      const loggedInUserId = req.user!.id;
      const convertedStatus = status ? convertToTitleCase(status) : undefined;
      const convertedPriority = priority ? convertToTitleCase(priority) : undefined;
      const isStandardUser = req.user?.role === 'User';

      if (pocketsIdentifier === 'me') {
        filterArgs.loggedInUserId= loggedInUserId.toString() ;
        filterArgs.is_default_pocket  = 'FALSE';
        filters.push(`entity_id = :loggedInUserId`);
        filters.push(`is_default_pocket  = :is_default_pocket `);
      } 
      else if (pocketsIdentifier === 'Default') {
        filterArgs.loggedInUserId= loggedInUserId.toString();
        filterArgs.is_default_pocket  = 'TRUE';
        filters.push(`entity_id = :loggedInUserId`);
        filters.push(`is_default_pocket  = :is_default_pocket `);
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
        filters.push(`entity_id = :user_id`);
      }
      else {
        throw new HttpError(400, 'Bad request');
      }

      if (category_id) {
        filterArgs.category_id = category_id;
        filters.push(`category_id = :category_id`);
      }

      if (start_at) {
        filterArgs.start_at = start_at;
        filters.push(`start_at = :start_at`);
      }

      if (completed_at) {
        filterArgs.completed_at = completed_at;
        filters.push(`completed_at = :completed_at`);
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
