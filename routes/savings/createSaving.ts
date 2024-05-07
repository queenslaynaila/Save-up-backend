import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { validateRequest } from '../../middleware/validationMiddleware';
import { CreateSavingInterface, validateSavingCreationSchema } from './types';

interface SavingInterface {
  amount: number;
  name: string;
}

const SQL_CREATE_SAVING = sql<CreateSavingInterface, SavingInterface>(`
  INSERT INTO savings (id, goal_id, user_id, amount)
  VALUES (
      (SELECT COALESCE(MAX(id), 0) + 1 FROM savings WHERE goal_id = :goal_id),
      :goal_id,
      :user_id,
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
      const { goal_id, amount  } = req.body;
      const savingResult = await SQL_CREATE_SAVING({ user_id, goal_id, amount })
        .one(new HttpError(400, 'Unable to complete the request'));
      const goalName = savingResult.name
      const amountPaid = savingResult.amount
      return res.json({ message: `Your saving of KES ${amountPaid.toFixed(2)} to ${goalName} successful!` });
    });
};