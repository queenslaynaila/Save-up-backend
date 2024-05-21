import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { validateRequest } from '../../middleware/validationMiddleware';
import { CreateSavingInterface, validateSavingCreationSchema } from './types';

interface SavingInterface {
  create_saving: string;
}

const SQL_CREATE_SAVING = sql<CreateSavingInterface, SavingInterface>(`
  SELECT create_saving(:user_id, :pocket_id, :amount, :entity_id )
`);

export default (router: Router) => {
  router.post<Record<string,never>,{ message:string }, CreateSavingInterface, Record<string,never>, Record<string,never>>(
    '/', 
    authMiddleware(), 
    validateRequest(validateSavingCreationSchema),
    async (req, res) => {
      const user_id= req.user!.id
      console.log(user_id)
      const { pocket_id, amount } = req.body;
      const savingResult = await SQL_CREATE_SAVING({ user_id, pocket_id, amount, entity_id:user_id })
        .one(new HttpError(400, 'Unable to complete the request'));
      const goalName = savingResult.create_saving
      return res.json({ message: `Your saving of KES ${amount.toFixed(2)} to ${goalName} was successful!` });
    });
};

