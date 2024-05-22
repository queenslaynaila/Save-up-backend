import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { DeletePocket } from './types'
import { IdParamInterface, MessageInterface } from '../../globalTypes/index'

const SQL_DELETE_POCKET = sql<DeletePocket, Record<string,never>>(`
  UPDATE pockets
  SET deleted_at = NOW()
  WHERE xid = :pocket_id
  AND entity_id = :entity_id
`);

export default (router: Router) => {
  router.patch<IdParamInterface, MessageInterface, Record<string,never>, Record<string,never>>(
    '/delete/:id', 
    authMiddleware(), 
    async (req, res) => {
      const pocket_id = parseInt(req.params.id);
      const userId = req.user!.id;
      await SQL_DELETE_POCKET({ pocket_id, entity_id: userId }).exec();
      return res.json({ message: 'Pocket deleted successfully' });
    });
};
