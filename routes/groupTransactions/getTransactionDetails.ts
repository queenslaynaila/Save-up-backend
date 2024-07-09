import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { TransactionRecipients, 
  TransactionDetails,
  TransactionInput,
  transactionInput,
} from './types';
import { validateRequest } from '../../middleware/validationMiddleware';

const SQL_GROUP_TRANSACTIONS = sql<TransactionRecipients, TransactionDetails >(`
  SELECT * FROM get_group_transaction_details(
    :user_id, :group_id, :transaction_id
);
`);

export default (router: Router) => {
  router.get<Record<string,never>, TransactionDetails[], TransactionInput, 
  Record<string,never>>(
    '/:transaction_id', 
    validateRequest(transactionInput),
    authMiddleware(),
    async (req, res) => {
      const members = await SQL_GROUP_TRANSACTIONS({ 
        user_id: req.user!.id, 
        group_id: req.body.group_id, 
        transaction_id: req.params.transaction_id
      }).many();  
      return res.json(members);
    });
};