import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';


const SQL_GET_ONGOING_ELECTION = sql<{ group_id: number, user_id:number} , { group_id: number, xid: number, initiator_id: number, type: string, initiator_name: string, created_at: string}>(`
  SELECT * FROM get_open_election_for_group(:group_id, :user_id)
`);

export default (router: Router) => {
  router.get<Record<string,never>, { group_id: number, xid: number, initiator_id: number, type: string, initiator_name: string, created_at: string}, { group_id: number, user_id:number} , Record<string,never>, Record<string,never>>(
    '/',
    authMiddleware(),
    async (req, res) => {
      const election = await SQL_GET_ONGOING_ELECTION({ ...req.body, user_id:req.user!.id}).one();
      res.json(election);
    }
  );
};