import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { validateRequest } from '../../middleware/validationMiddleware';
import { CreateSavingInterface, SavingInterface, ValidateSavingCreation } from '../../types';

const SQL_CREATE_SAVING = sql<CreateSavingInterface, SavingInterface>(`
    INSERT INTO savings (id,user_id,goal_id, amount)
    SELECT COALESCE((SELECT MAX(id) FROM savings WHERE user_id = :user_id), 0) + 1,
    :user_id,:goal_id,:amount
    RETURNING *
`);

export default (router: Router) => {
  router.post<Record<string, never>,SavingInterface,CreateSavingInterface,
  Record<string, never>,Record<string, never>>(
    '/', 
    authMiddleware(), 
    validateRequest(ValidateSavingCreation),
    async (req, res) => {
      const user_id= req.user!.id
      const { goal_id, amount} = req.body;
      const contributionResult = await SQL_CREATE_SAVING({ user_id,goal_id, amount })
        .one(new HttpError(404, 'Unable to complete the request'));
      return res.json(contributionResult);
    });
};
