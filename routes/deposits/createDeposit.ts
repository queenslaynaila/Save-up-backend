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
      (SELECT COALESCE(MAX(id), 0) + 1 FROM deposits WHERE pocket_id = :pocketId),
      :pocketId,
      :userId,
      COALESCE(:donorName, NULL),
      COALESCE(:donorEmail, NULL),
      COALESCE(:donorPhoneNumber, NULL),
      :amount
  )
  RETURNING amount, (
      SELECT name FROM pockets WHERE id = :pocketId
  ) AS name;
`);

export default (router: Router) => {
  router.post<Record<string,never>,{ message:string }, CreateDepositInterface, Record<string,never>, Record<string,never>>(
    '/', 
    authMiddleware(), 
    validateRequest(validateDepositCreationSchema),
    async (req, res) => {
      const userId= req.user!.id
      const { pocketId, amount, donorName, donorEmail, donorPhoneNumber  } = req.body;
      const depositResult = await SQL_CREATE_DEPOSIT({ userId, pocketId, amount, donorName, donorEmail, donorPhoneNumber })
        .one(new HttpError(400, 'Unable to complete the request'));
      const pocketName = depositResult.name
      const amountPaid = depositResult.amount
      return res.json({ message: `Your deposit of KES ${amountPaid.toFixed(2)} to ${pocketName} successful!` });
    });
};
