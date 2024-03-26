import authMiddleware from "../../middleware/auth";
import {Router} from "express";
import {ID_SCHEMA} from "../../types";
import {sql} from "../../db";
import  { validateRequest } from '../../middleware/validationMiddleware';

interface CategorySchema {
  id: number;
  user_id: number;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

const SQL_DELETE_CATEGORY = sql<Pick<CategorySchema, "id" | "user_id">,  Record<string, never>>(`
  UPDATE categories
  SET deleted_at = NOW()
  WHERE id = :id
  AND user_id = :user_id
`);

export default (router: Router) => {
  router.delete<{ id: string }, { message: string }, Record<string, never>, Record<string, never>>(
    "/:id",
    authMiddleware(),
    validateRequest(ID_SCHEMA),
    async (req, res) => {
      const id = parseInt(req.params.id)
      await SQL_DELETE_CATEGORY({
        id: id,
        user_id: req.user!.id
      }).exec();
      return res.json({message: "Categories deleted successfully"});
    }
  );
};
