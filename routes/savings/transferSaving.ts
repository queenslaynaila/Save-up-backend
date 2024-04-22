import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
type ExternalSavings = {
  contributer: string,
  amount: number,
  phone_number: string
}

const TRANSFER_SAVINGS = sql<{source_goal_id: number,destination_goal_id: number,user_id: number,amount: number}, ExternalSavings>(`
    SELECT contributer, amount, phone_number FROM external_savings 
    WHERE group_id = :group_id
`);

export default (router: Router) => {
  router.get<{ group_id: string }, ExternalSavings[], Record<string,never>, Record<string,never>>(
    '/:group_id', 
    authMiddleware(),
    async (req, res) => {
      const group_id = parseInt(req.params.group_id);
      const externalSavings = await TRANSFER_SAVINGS({group_id}).many();
      return res.json(externalSavings);
    });
};
