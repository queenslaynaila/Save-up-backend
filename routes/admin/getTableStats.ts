import { Router } from 'express';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/auth';
import { convertToTitleCase } from '../../middleware/caseNormalization';
import { UserRole } from '../../types';

const SQL_GET_CUMULATIVES = (query: string) =>sql<{ operator: string; resource: string }, { totals: number }>(query);
const VALID_OPERATORS = ['SUM', 'MAX', 'MIN', 'AVG', 'COUNT'];
const VALID_RESOURCES = ['contributions', 'savings', 'expenses'];
const VALID_STATUS = ['Completed', 'Dormant', 'In Progress'];

export default (router: Router) => {
  router.get<{ resource: string; operator: string },{totals:number}, Record<string, never>,{ user_id?: string; priority?: string; status?: string; category_id?: string; start_date?: string; end_date?: string}>(
    '/stats/:resource/:operator',
    authMiddleware({ roles: [UserRole.ADMIN] }),
    async (req, res) => {
      req.params.resource = req.params.resource.toLowerCase();
      req.params.operator = req.params.operator.toUpperCase();
      const { resource, operator } = req.params;
      const { user_id, priority, status, category_id, start_date, end_date } = req.query 
      const formattedStatus = status ? convertToTitleCase(status) : '';
      if (!VALID_RESOURCES.includes(resource)) {
        throw new HttpError(400, 'Invalid resource');
      }

      if (!VALID_OPERATORS.includes(operator)) {
        throw new HttpError(400, 'Invalid operator');
      }
      if (status && !VALID_STATUS.includes(formattedStatus)) {
        throw new HttpError(400, 'Invalid status');
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
