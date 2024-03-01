import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';

const SQL_GET_CUMULATIVES = (query: string) => sql<{ operator: string;tableName: string }, { totals: number }>(query);

export default (router: Router) => {
  router.get('/cumulatives', authMiddleware(), async (req, res) => {
    let operator = req.query.operator as string;
    const tableName = req.query.tableName as string;


    const validOperators = ['SUM', 'MAX', 'MIN', 'AVG', 'COUNT', 'VAR_POP', 'STDDEV_POP'];

    operator = operator.toUpperCase();

    if (!validOperators.includes(operator)) {
      throw new HttpError(400, 'Invalid operator');
    }
    const query =`SELECT COALESCE(${operator}(amount), 0) AS ${operator}
    FROM  ${tableName}`
    const values: { operator: string;tableName: string} = { operator, tableName };
    

    const result = await SQL_GET_CUMULATIVES(query)(values).one();
    res.json(result);
  });
};

