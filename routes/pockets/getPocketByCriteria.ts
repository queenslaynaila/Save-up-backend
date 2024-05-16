import { Response, Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { convertToTitleCase, isValidValue } from '../../middleware/caseNormalization';
import { HttpError } from '../../middleware/errorMiddleware';
import { PocketInterface, PocketsConditionsQueryInterface, getPocketInterface, PocketParam } from './types';

const ACCEPTED_STATUS_VALUES = ['In Progress', 'Dormant', 'Completed'];
const ACCEPTED_PRIORITY_VALUES = ['High', 'Intermediate', 'Low'];

const SQL_GET_POCKETS = sql<Record<string, never>, PocketInterface>(`
  SELECT p.id, p.name, c.name AS category_name, p.target_amount, p.priority, 
  p.status, p.pocket_type, ir.rate AS interest_rate, p.target_at, p.created_at
  FROM pockets p
  LEFT JOIN interest_rates ir ON p.pocket_type = ir.pocket_type  
  LEFT JOIN categories c ON p.category_id = c.id       
  WHERE p.deleted_at IS NULL
`);

export default (router: Router) => {
  router.get<string, PocketParam, PocketInterface[], getPocketInterface, PocketsConditionsQueryInterface>(
    '/:pockets_identifier', 
    authMiddleware(), 
    async (req, res: Response) => {
      const { pockets_identifier } = req.params;
      const entity_id = req.body.entity_id ? req.body.entity_id : req.user!.id;
      const { category_id, priority, status, created_at, completed_at  } = req.query;

      const filters: string[] = [];
      const filterArgs: Record<string, string> = {};
      const convertedStatus = status ? convertToTitleCase(status) : undefined;
      const convertedPriority = priority ? convertToTitleCase(priority) : undefined;
      const isStandardUser = req.user?.role === 'User';

      if (pockets_identifier === 'me') {
        filterArgs.loggedInUserId= entity_id.toString() ;
        filterArgs.isDefaultPocket  = 'FALSE';
        filters.push(`entity_id = :loggedInUserId`);
        filters.push(`is_default_pocket  = :isDefaultPocket`);
      } 
      else if (pockets_identifier === 'default') {
        filterArgs.loggedInUserId= entity_id.toString();
        filterArgs.isDefaultPocket  = 'TRUE';
        filters.push(`entity_id = :loggedInUserId`);
        filters.push(`is_default_pocket  = :isDefaultPocket`);
      } 
      else if (pockets_identifier === 'group') {
        filterArgs.group_id = entity_id.toString();
        filters.push(`entity_id = :group_id`);
      } 
      else if (pockets_identifier === 'all') {
        if (isStandardUser) {
          throw new HttpError(403, 'Forbidden');
        }
      }
      else if (parseInt(pockets_identifier)) { 
        if (isStandardUser)  {
          throw new HttpError(403, 'Forbidden');
        }
        filterArgs.user_id = pockets_identifier;
        filters.push(`entity_id = :user_id`);
      }
      else {
        throw new HttpError(400, 'Bad request');
      }

      if (category_id) {
        console.log('category_id', category_id)
        filterArgs.category_id = category_id;
        filters.push(`category_id = :category_id`);
      }

      if (created_at) {
        filterArgs.created_at = created_at;
        filters.push(`DATE(p.created_at) = :created_at`);
      }

      if (completed_at) {
        filterArgs.completed_at = completed_at;
        filters.push(`DATE(completed_at) = :completed_at`);
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
