import authMiddleware from "../../middleware/auth";
import {Router} from "express";
import {ID_SCHEMA} from "../../types";
import {HttpError} from "../../middleware/errorMiddleware";
import {sql} from "../../db";

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
    async (req, res) => {
      const validationResult = ID_SCHEMA.safeParse(req.params.id);
      if (!validationResult.success) {
        throw new HttpError(400, "Invalid category ID");
      }
      await SQL_DELETE_CATEGORY({
        id: validationResult.data,
        user_id: req.user!.id
      }).exec();
      return res.json({message: "Categories deleted successfully"});
    }
  );
};
