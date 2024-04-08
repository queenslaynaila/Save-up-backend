import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { sql } from '../../db';

const SQL_CREATE_MESSAGE = sql<{sender_id:number;group_id:number;message:string}, Record<string, never>>(`
        INSERT INTO expenses (id, user_id, category_id, description, amount, expense_spent_at)
        VALUES (:id, :user_id, :category_id, :description, :amount, :expense_date)
        RETURNING user_id, id, category_id, description, amount, expense_spent_at, created_at
`);

export default (router: Router) => {
  router.post<Record<string, never>, Record<string, never>,{ group_id: number; message: string },Record<string, never>,Record<string, never> >(
    '/', 
    authMiddleware(), 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (req, _res) => {
      const loggedInUserId = req.user!.id;
      const { group_id, message } = req.body;
      await SQL_CREATE_MESSAGE({
        sender_id: loggedInUserId,
        group_id,
        message
      }).exec();
    });
};
