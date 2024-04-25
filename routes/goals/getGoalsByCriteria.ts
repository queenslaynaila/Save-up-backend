import { Response, Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { convertToTitleCase, isValidValue } from '../../middleware/caseNormalization';
import { HttpError } from '../../middleware/errorMiddleware';
import { GoalInterface, GoalsConditionsQueryInterface, GoalParam } from './types';

const ACCEPTED_STATUS_VALUES = ['In Progress', 'Dormant', 'Completed'];
const ACCEPTED_PRIORITY_VALUES = ['High', 'Intermediate', 'Low'];

const SQL_GET_GOALS = sql<Record<string, never>, GoalInterface>(`
  SELECT g.id, g.name, g.entity_id, g.category_id, g.amount, g.priority,
         g.target_at, g.created_at, g.completed_at, g.updated_at, g.goal_type, 
         ir.rate AS interest_rate
  FROM goals g
  LEFT JOIN interest_rates ir ON g.goal_type = ir.type
  WHERE g.deleted_at IS NULL;
`);

export default (router: Router) => {
  router.get<string, GoalParam, GoalInterface[], Record<string,never>, GoalsConditionsQueryInterface>(
    '/:goalsIdentifier', 
    authMiddleware(), 
    async (req, res: Response) => {
      const { goalsIdentifier } = req.params;
      const { category_id, priority, status,start_at, completed_at  } = req.query;

      const filters: string[] = [];
      const filterArgs: Record<string, string> = {};
      const loggedInUserId = req.user!.id;
      const convertedStatus = status ? convertToTitleCase(status) : undefined;
      const convertedPriority = priority ? convertToTitleCase(priority) : undefined;
      const isStandardUser = req.user?.role === 'User';

      if (goalsIdentifier === 'me') {
        filterArgs.loggedInUserId= loggedInUserId.toString() ;
        filterArgs.is_default_vault = 'FALSE';
        filters.push(`entity_id = :loggedInUserId`);
        filters.push(`is_default_vault = :is_default_vault`);
      } 
      else if (goalsIdentifier === 'Default') {
        filterArgs.loggedInUserId= loggedInUserId.toString();
        filterArgs.is_default_vault = 'TRUE';
        filters.push(`entity_id = :loggedInUserId`);
        filters.push(`is_default_vault = :is_default_vault`);
      } 
      else if (goalsIdentifier === 'all') {
        if (isStandardUser) {
          throw new HttpError(403, 'Forbidden');
        }
      }
      else if (parseInt(goalsIdentifier)) { 
        if (isStandardUser)  {
          throw new HttpError(403, 'Forbidden');
        }
        filterArgs.user_id = goalsIdentifier;
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

      const query = SQL_GET_GOALS({});
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      res.json(await query.many());
    });
};
