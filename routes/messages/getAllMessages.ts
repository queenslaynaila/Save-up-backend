import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { sql } from '../../db';

const SQL_GET_MESSAGES = sql<{ group_id: number }, {sender_id:number;message:string;sent_at:Date}>(`
  SELECT sender_id, message, sent_at
  FROM messages
  WHERE group_id = :group_id
`);

export default (router: Router) => {
  router.get<Record<string, never>, { sender_id: number; message: string; sent_at: Date }[],{ group_id: number} , Record<string, never>, Record<string, never>>(
    '/:group_id',
    authMiddleware(),
    async (req, res) => {
      const { group_id } = req.params;
      const messages = await SQL_GET_MESSAGES({ group_id }).many();
      return res.json(messages);
    });
};




