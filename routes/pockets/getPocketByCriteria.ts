import { Response, Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { convertToTitleCase, isValidValue } from '../../middleware/caseNormalization';
//import { HttpError } from '../../middleware/errorMiddleware';
//import isStandardUser from '../../middleware/isStandardUser';
import { PocketInterface, 
  PocketsConditionsQueryInterface, 
  getPocketInterface
} from './types';

const ACCEPTED_STATUS_VALUES = ['In Progress', 'Dormant', 'Completed'];
const ACCEPTED_PRIORITY_VALUES = ['High', 'Intermediate', 'Low'];

const SQL_GET_POCKETS = sql<{entity_id: number}, PocketInterface>(`
  SELECT pockets.id, 
        pockets.name, 
        (SELECT categories.name FROM categories WHERE categories.id = pockets.category_id) AS category_name, 
        pockets.target_amount, 
        pockets.priority, 
        pockets.status, 
        pockets.pocket_type, 
        pockets.target_at, 
        pockets.created_at
  FROM pockets
  WHERE pockets.deleted_at IS NULL
  AND pockets.entity_id = :entity_id
`);


export default (router: Router) => {
  router.get<string, Record<string, never>, PocketInterface[], getPocketInterface, PocketsConditionsQueryInterface>(
    '/', 
    authMiddleware(), 
    async (req, res: Response) => {
      const entity_id = req.body.entity_id ?? req.user!.id;
      const { category_id, priority, status, start_date, end_date  } = req.query;

      const filters: string[] = [];
      const filterArgs: Record<string, string> = {};

      if (category_id) {
        filterArgs.category_id = category_id;
        filters.push(`category_id = :category_id`);
      }
      if (start_date && end_date) {
        filterArgs.start_date = start_date;
        filterArgs.end_date = end_date;
        filters.push(`DATE(created_at) BETWEEN :start_date AND :end_date`);
      } else {
        if (start_date) {
          filterArgs.start_date = start_date;
          filters.push(`DATE(created_at) >= :start_date`);
        }
        if (end_date) {
          filterArgs.end_date = end_date;
          filters.push(`DATE(created_at)<= :end_date`);
        }
      }

      const convertedStatus = status ? convertToTitleCase(status) : undefined;
      const convertedPriority = priority ? convertToTitleCase(priority) : undefined;

      if (convertedPriority && isValidValue(convertedPriority, ACCEPTED_PRIORITY_VALUES)) {
        filterArgs.priority = convertedPriority;
        filters.push(`priority = :priority`);
      }

      if (convertedStatus && isValidValue(convertedStatus, ACCEPTED_STATUS_VALUES)) {
        filterArgs.status = convertedStatus;
        filters.push(`status = :status`);
      }

      const query = SQL_GET_POCKETS({ entity_id });
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      res.json(await query.many());
    });
};
