import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { ID_SCHEMA } from '../../types';
import { validateRequest } from '../../middleware/validationMiddleware';

const SQL_DELETE_CATEGORY = sql<{ id: number;}, Record<string, never>>(`
  UPDATE categories
  SET deleted_at = NOW()
  WHERE id = :id
`);

export default (router: Router) => {
  router.delete<{ id: string }, { message: string }, Record<string, never>, Record<string, never>>(
    "/:id",
    authMiddleware(),
    validateRequest(ID_SCHEMA),
    async (req, res) => {
      const id = parseInt(req.params.id)
      await SQL_DELETE_CATEGORY({id: id,}).exec();
      return res.json({message: "Categories deleted successfully"});
    }
  );
};
