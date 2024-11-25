import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { convertToTitleCase } from '../../middleware/caseNormalization';
import { HttpError } from '../../middleware/errorMiddleware';
import {
  FinancialStatsInterface,
  financialStatsSchema,
  statsParamSchema,
  statsQuerySchema,
  ValidOperatorsEnum,
  ValidResourcesEnum,
  ValidStatusEnum
} from './types';

const SQL_GET_CUMULATIVES = (query: string) => sql<
{ operator: string; resource: string },
FinancialStatsInterface>(query);

const getFinancialStats = (router: Router) => {
  router.route({
    method: 'get',
    path: '/',
    summary: 'Get financial statistics',
    schema: {
      query: statsQuerySchema,
      params: statsParamSchema
    },
    response: {
      schema: financialStatsSchema
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      req.params.resource = req.params.resource.toLowerCase();
      req.params.operator = req.params.operator.toUpperCase();
      const { resource, operator } = req.params;
      const { user_id, priority, status, category_id, start_date, end_date } = req.query;
      const formattedStatus = typeof status === 'string' ? convertToTitleCase(status) : '';
      if (!ValidResourcesEnum.safeParse(resource).success) {
        throw new HttpError(400);
      }
      if (!ValidOperatorsEnum.safeParse(operator).success) {
        throw new HttpError(400);
      }
      if (status && !ValidStatusEnum.safeParse(status).success) {
        throw new HttpError(400);
      }
      let query = `SELECT COALESCE(${operator}(amount), 0) AS ${operator}
      FROM ${resource} WHERE 1=1`;
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
      const values: { operator: string; resource: string } = {
        operator,
        resource
      };
      const result = await SQL_GET_CUMULATIVES(query)(values).one();
      res.json(result);
    }
  });
};

export default getFinancialStats;