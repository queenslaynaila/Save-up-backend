import authMiddleware, {UserRole} from "../../middleware/auth";
import {NextFunction, Request, Response, Router} from "express";
import {HttpError, idSchema} from "../../types";
import pool from "../../db";


export default (router: Router) => {
  router.get(
    "/:id",
    authMiddleware({roles: [UserRole.ADMIN, UserRole.USER]}),
    validate(),
    async (req, res) => {
      const validationResult = idSchema.safeParse(req.params.id);
      if (!validationResult.success) {
        throw new HttpError(400, "Invalid expense ID");
      }
      const id = validationResult.data;
      const userId = req.user?.id;
      const query = "SELECT * FROM expenses WHERE id = $1 AND user_id = $2";
      const result = await pool.query(query, [id, userId]);
      if (result.rows.length === 0) {
        throw new HttpError(404, "Expense with submitted ID not found");
      }
      return res.status(200).json(result.rows[0]);
    });
}
