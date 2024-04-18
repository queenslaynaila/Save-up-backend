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

const SQL_CREATE_SAVING = sql<CreateSavingInterface, SavingInterface>(`
  INSERT INTO savings (id,user_id,goal_id, amount)
  VALUES (:id,:user_id,:goal_id,:amount)
  RETURNING amount, goals.name AS name
  FROM savings
  INNER JOIN goals ON goals.id = savings.goal_id;
`);

export default (router: Router) => {
  router.post<Record<string,never>,{ message:string }, CreateSavingInterface, Record<string,never>, Record<string,never>>(
    '/', 
    authMiddleware(), 
    validateRequest(validateSavingCreationSchema),
    async (req, res) => {
      const user_id= req.user!.id
      const { goal_id, amount} = req.body;
      const contributionResult = await SQL_CREATE_SAVING({ user_id,goal_id, amount })
        .one(new HttpError(404, 'Unable to complete the request'));
      const goalName = contributionResult.name
      const amountPaid = contributionResult.amount
      const message = `Confirmed, your saving of KES ${amountPaid} has been deposited for goal ${goalName}`;
      return res.json({message});
    });
};
