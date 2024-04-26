import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { UserRole, IdParamInterface }  from '../../globalTypes';

const SQL_DELETE_CATEGORY = sql<{ id: number;}, Record<string,never>>(`
  UPDATE categories
  SET deleted_at = NOW()
  WHERE id = :id
`);

export default (router: Router) => {
  router.patch<IdParamInterface, { message: string }, Record<string,never>, Record<string,never>>(
    "/records/:id",
    authMiddleware({roles:[ UserRole.ADMIN ]}),
    async (req, res) => {
      const id = parseInt(req.params.id)
      await SQL_DELETE_CATEGORY({id}).exec();
      return res.json({ message: "Category deleted successfully" });
    }
  );
};
