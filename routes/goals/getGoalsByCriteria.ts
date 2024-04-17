import { Response, Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { convertToTitleCase, isValidValue } from '../../middleware/caseNormalization';
import { HttpError } from '../../middleware/errorMiddleware';
import { GoalInterface, GoalsConditionsQueryInterface } from '../../types/index';

const ACCEPTED_STATUS_VALUES = ['In Progress', 'Dormant', 'Completed'];
const ACCEPTED_PRIORITY_VALUES = ['High', 'Intermediate', 'Low'];

const SQL_GET_SAVINGS = sql<Record<string,never>,GoalInterface>(`
  SELECT id, entity_id, description, category_id, amount, priority, target_at ,created_at,completed_at FROM goals 
  WHERE deleted_at IS NULL
`);

export default (router: Router) => {
  router.get<string,{ goalsIdentifier: string },GoalInterface[], Record<string,never>,GoalsConditionsQueryInterface>(
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
        filters.push(`entity_id = :loggedInUserId`);
      } else if (goalsIdentifier === 'all') {
        if (isStandardUser) {
          throw new HttpError(403, 'Forbidden');
        }
      }else if (parseInt(goalsIdentifier)) { 
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

      const query = SQL_GET_SAVINGS({});
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      res.json(await query.many());
    });
};
