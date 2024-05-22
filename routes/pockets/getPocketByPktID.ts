import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { PocketInterface } from './types';
import { IdParamInterface, IdInterface } from '../../globalTypes/index';

const SQL_GET_POCKET_BY_ID = sql<IdInterface, PocketInterface>(`
  SELECT p.xid, p.name, c.name AS category_name, p.target_amount, p.priority, 
        p.pocket_type, p.target_at
  FROM pockets p
  LEFT JOIN categories c ON p.category_id = c.id       
  WHERE p.xid = :id  
  AND p.deleted_at IS NULL;
`);

export default (router: Router) => {
  router.get<IdParamInterface, PocketInterface, Record<string,never>, Record<string,never>>(
    '/records/:id', 
    authMiddleware(), 
    async (req, res) => {
      const pocketId = (parseInt(req.params.id));
      const query = SQL_GET_POCKET_BY_ID({ id: pocketId });
      const pocket = await query.one(new HttpError(404, 'Not found'));
      return res.json(pocket);
    });
};
