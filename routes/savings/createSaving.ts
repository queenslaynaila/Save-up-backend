import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { validateRequest } from '../../middleware/validationMiddleware';
import { CreateSavingInterface, validateSavingCreationSchema } from '../../types';

interface SavingInterface {
  amount: number;
  name: string;
}

const SQL_CREATE_DEPOSIT = sql<CreateSavingInterface, SavingInterface>(`
  INSERT INTO deposits (id, goal_id, user_id, donor_name, donor_email, donor_phone_number, amount)
  VALUES (
      (SELECT COALESCE(MAX(id), 0) + 1 FROM deposits WHERE goal_id = :goal_id),
      :goal_id,
      :user_id,
      :donor_name,
      :donor_email,
      :donor_phone_number,
      :amount
  )
  RETURNING amount, (
      SELECT name FROM goals WHERE id = :goal_id
  ) AS name;
`);

export default (router: Router) => {
  router.post<Record<string,never>,{ message:string }, CreateSavingInterface, Record<string,never>, Record<string,never>>(
    '/', 
    authMiddleware(), 
    validateRequest(validateSavingCreationSchema),
    async (req, res) => {
      const user_id= req.user!.id
      const { goal_id, amount} = req.body;
      const contributionResult = await SQL_CREATE_DEPOSIT({ user_id,goal_id, amount })
        .one(new HttpError(404, 'Unable to complete the request'));
      const goalName = contributionResult.name
      const amountPaid = contributionResult.amount
      const message = `Confirmed, your saving of KES ${amountPaid} has been deposited for goal ${goalName}`;
      return res.json({message});
    });
};
