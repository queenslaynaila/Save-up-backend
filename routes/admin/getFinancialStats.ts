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
    '/financial-stats/:resource/:operator',
    authMiddleware({ roles: [UserRole.ADMIN] }),
    async (req, res) => {

      req.params.resource = req.params.resource.toLowerCase();
      req.params.operator = req.params.operator.toUpperCase();

      const { resource, operator } = req.params;
      const { userId, priority, status, categoryId, startDate, endDate } = req.query 
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

      if (['deposits', 'expenses'].includes(resource)) {
        if (userId) query += ` AND user_id = '${userId}'`;
        if (categoryId) query += ` AND category_id = '${categoryId}'`;
        if (priority) query += ` AND priority = '${priority}'`;
        if (startDate) query += ` AND completed_date >= '${startDate}'`;
        if (endDate) query += ` AND completed_date <= '${endDate}'`;
      }

      if (resource === 'deposits' && status) {
        query += ` AND status = '${formattedStatus}'`;
      }

      const values: { operator: string; resource: string } = { operator, resource };
      const result = await SQL_GET_CUMULATIVES(query)(values).one();
      res.json(result);

    }
  );
};
