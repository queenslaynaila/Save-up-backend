import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { validateRequest } from '../../middleware/validationMiddleware';
import { CreateDepositInterface, validateDepositCreationSchema } from './types';

interface DepositInterface {
  amount: number;
  name: string;
}

const SQL_CREATE_DEPOSIT = sql<CreateDepositInterface, DepositInterface>(`
  INSERT INTO deposits (id, pocket_id, user_id, donor_name, donor_email, donor_phone_number, amount)
  VALUES (
      (SELECT COALESCE(MAX(id), 0) + 1 FROM deposits WHERE pocket_id = :pocket_id),
      :pocket_id,
      :user_id,
      COALESCE(:donor_name, NULL),
      COALESCE(:donor_email, NULL),
      COALESCE(:donor_phone_number, NULL),
      :amount
  )
  RETURNING amount, (
      SELECT name FROM pockets WHERE id = :pocket_id
  ) AS name;
`);

export default (router: Router) => {
  router.post<Record<string,never>,{ message:string }, CreateDepositInterface, Record<string,never>, Record<string,never>>(
    '/', 
    authMiddleware(), 
    validateRequest(validateDepositCreationSchema),
    async (req, res) => {
      const user_id= req.user!.id
      const { pocket_id, amount, donor_name, donor_email, donor_phone_number  } = req.body;
      const depositResult = await SQL_CREATE_DEPOSIT({ user_id, pocket_id, amount, donor_name, donor_email, donor_phone_number })
        .one(new HttpError(400, 'Unable to complete the request'));
      const pocketName = depositResult.name
      const amountPaid = depositResult.amount
      return res.json({ message: `Your deposit of KES ${amountPaid.toFixed(2)} to ${pocketName} successful!` });
    });
};
