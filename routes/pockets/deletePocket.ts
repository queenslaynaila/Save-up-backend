import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { DeletePocket } from './types'
import { IdParamInterface, MessageInterface } from '../../globalTypes/index'

const SQL_DELETE_POCKET = sql<DeletePocket, Record<string,never>>(`
  UPDATE pockets
  SET deleted_at = NOW()
  WHERE entity_id = :entity_id
  AND xid = :pocket_id
  AND deleted_at IS NULL
`);

export default (router: Router) => {
  router.delete<IdParamInterface, MessageInterface, Record<string,never>, Record<string,never>>(
    '/:id', 
    authMiddleware(), 
    async (req, res) => {
      const pocketId = parseInt(req.params.id);
      const entity_id = req.body.entity_id ? req.body.entity_id : req.user!.id;
      await SQL_DELETE_POCKET({ pocket_id: pocketId, entity_id}).exec();
      res.sendStatus(204);
    });
};
