import { Router } from 'express';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/authorization';
import { convertToTitleCase } from '../../middleware/caseNormalization';
import { UserRole } from '../../globalTypes/index';
import { StatsQueryInterface, StatsParamInterface, FinancialStatsInterface, ValidOperatorsEnum, ValidResourcesEnum, ValidStatusEnum  } from './types';

const SQL_GET_CUMULATIVES = (query: string) =>sql<{ operator: string; resource: string }, FinancialStatsInterface>(query);

export default (router: Router) => {
  router.get<StatsParamInterface, FinancialStatsInterface, Record<string,never>, StatsQueryInterface>(
    '/:resource/:operator',
    authMiddleware({ roles: [UserRole.ADMIN] }),
    async (req, res) => {
      req.params.resource = req.params.resource.toLowerCase();
      req.params.operator = req.params.operator.toUpperCase();
      const { resource, operator } = req.params;
      const { user_id, priority, status, category_id, start_date, end_date } = req.query 
      const formattedStatus = status ? convertToTitleCase(status) : '';
      if (!ValidResourcesEnum.safeParse(resource).success) {
        throw new HttpError(400, 'Invalid resource');
      }
      if (!ValidOperatorsEnum.safeParse(operator).success) {
        throw new HttpError(400, 'Invalid operator');
      }
      if ( status && !ValidStatusEnum.safeParse(status).success) {
        throw new HttpError(400, 'Invalid operator');
      }
      let query = `SELECT COALESCE(${operator}(amount), 0) AS ${operator} FROM ${resource} WHERE 1=1`;
      if (['savings', 'expenses'].includes(resource)) {
        if (user_id) query += ` AND user_id = '${user_id}'`;
        if (category_id) query += ` AND category_id = '${category_id}'`;
        if (priority) query += ` AND priority = '${priority}'`;
        if (start_date) query += ` AND completed_date >= '${start_date}'`;
        if (end_date) query += ` AND completed_date <= '${end_date}'`;
      }
      if (resource === 'savings' && status) {
        query += ` AND status = '${formattedStatus}'`;
      }
      const values: { operator: string; resource: string } = { operator, resource };
      const result = await SQL_GET_CUMULATIVES(query)(values).one();
      res.json(result);
    }
  );
};