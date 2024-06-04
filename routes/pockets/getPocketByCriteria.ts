import { Response, Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { convertToTitleCase, isValidValue } from '../../middleware/caseNormalization';
import { HttpError } from '../../middleware/errorMiddleware';
import { PocketInterface, PocketsConditionsQueryInterface, getPocketInterface, PocketParam } from './types';

const ACCEPTED_STATUS_VALUES = ['In Progress', 'Dormant', 'Completed'];
const ACCEPTED_PRIORITY_VALUES = ['High', 'Intermediate', 'Low'];

const SQL_GET_POCKETS = sql<Record<string, never>, PocketInterface>(`
  SELECT p.xid, p.name, c.name AS category_name, p.target_amount, p.priority, 
  p.status, p.pocket_type, p.target_at, p.created_at
  FROM pockets p
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
      const { category_id, priority, status, start_date, end_date  } = req.query;

      const filters: string[] = [];
      const filterArgs: Record<string, string> = {};
      const convertedStatus = status ? convertToTitleCase(status) : undefined;
      const convertedPriority = priority ? convertToTitleCase(priority) : undefined;
      const isStandardUser = req.user?.role === 'User';

      if (pockets_identifier === 'me') {
        filterArgs.loggedInUserId= entity_id.toString() ;
        filterArgs.xid  = '1';
        filters.push(`entity_id = :loggedInUserId`);
        filters.push(`xid <> :xid`); //exclude default pkts from here
      } 
      else if (pockets_identifier === 'default') { // only user default
        filterArgs.xid  = '1';
        filters.push(`xid  = :xid`);
      } 
      else if (pockets_identifier === 'group') { //group pockets
        filterArgs.group_id = entity_id.toString();
        filters.push(`entity_id = :group_id`);
      } 
      else if (parseInt(pockets_identifier)) { //by user id
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
        filterArgs.category_id = category_id;
        filters.push(`category_id = :category_id`);
      }

      if (start_date ) {
        filterArgs.start_date = start_date;
        filters.push(`DATE(p.created_at) > :start_date`);
      }
      if ( end_date) {
        filterArgs.end_date = end_date;
        filters.push(`DATE(p.created_at) <= :end_date`);
      }
      if (start_date && end_date) {
        filterArgs.start_date = start_date;
        filterArgs.end_date = end_date;
        filters.push(`DATE(p.created_at) BETWEEN :start_date AND :end_date`);
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
