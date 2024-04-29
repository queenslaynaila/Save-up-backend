import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { DeletePocket } from './types'
import { IdParamInterface, MessageInterface } from '../../globalTypes/index'

const SQL_DELETE_POCKET = sql<DeletePocket, Record<string,never>>(`
  UPDATE pockets
  SET deleted_at = NOW()
  WHERE id = :id
  AND entity_id = :entityId
`);

export default (router: Router) => {
  router.patch<IdParamInterface, MessageInterface, Record<string,never>, Record<string,never>>(
    '/delete/:id', 
    authMiddleware(), 
    async (req, res) => {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      await SQL_DELETE_POCKET({ id, entityId: userId }).exec();
      return res.json({ message: 'Pocket deleted successfully' });
    });
};
