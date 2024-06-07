import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { BaseSavingType } from './types';
import { IdParamInterface,  XidEntityInterface } from '../../globalTypes/index';

const  SQL_GET_DEPOSIT_BY_ID = sql<XidEntityInterface, BaseSavingType>(`
  SELECT pocket_id, amount 
  FROM savings 
  WHERE xid = :id 
  AND entity_id = :entity_id
`);

export default (router: Router) => {
  router.get<IdParamInterface, BaseSavingType, Record<string,never>, Record<string,never>>(
    '/:id', 
    authMiddleware(), 
    async (req, res) => {
      const entity_id = req.body.entity_id ?? req.user!.id;
      const result = await SQL_GET_DEPOSIT_BY_ID({ 
        xid:parseInt(req.params.id), 
        entity_id })
        .one(new HttpError(404, 'Not found'));
      return res.json(result);
    });
};