import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
type ExternalSavings = {
  contributer: string,
  amount: number,
  phone_number: string
}

const SQL_GET_EXTERNAL_SAVINGS = sql<{group_id: number}, ExternalSavings>(`
    SELECT contributer, amount, phone_number FROM external_savings 
    WHERE group_id = :group_id
`);

export default (router: Router) => {
  router.get<{ group_id: string }, ExternalSavings[], Record<string,never>, Record<string,never>>(
    '/:group_id', 
    authMiddleware(),
    async (req, res) => {
      const group_id = parseInt(req.params.group_id);
      const externalSavings = await SQL_GET_EXTERNAL_SAVINGS({group_id}).many();
      return res.json(externalSavings);
    });
};
