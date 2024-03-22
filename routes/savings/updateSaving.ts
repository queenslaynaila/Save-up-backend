import { Router } from 'express';
import { z } from 'zod';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { savingInterface } from './index';
import { updateSavingSchema } from '../../types';


const SQL_UPDATE_SAVING = sql<z.infer<typeof updateSavingSchema>& { user_id:number; id: number }, savingInterface>(`
  UPDATE savings
  SET description = COALESCE(:description,  savings.description),
      category_id = COALESCE(:category_id,  savings.category_id),
      amount = COALESCE(:amount,  savings.amount),
      priority = COALESCE(:priority,  savings.priority ),
      target_at = COALESCE(:target_at,  savings.target_at )
  WHERE user_id = :user_id AND id = :id
  RETURNING *
`);


export default (router: Router) => {
  router.patch('/:id', authMiddleware(), async (req, res) => {
    const savingId = parseInt(req.params.id);
    const userId = req.user!.id;

    const validatedSavings = updateSavingSchema.safeParse(req.body);
    if (!validatedSavings.success) {
      throw new HttpError(422, 'Invalid saving data');
    }

    const { description, category_id, amount, priority, target_at } = validatedSavings.data;

    const result = await SQL_UPDATE_SAVING({
      user_id: userId,
      id: savingId ,
      description: description ,
      category_id: category_id ,
      amount: amount ,
      priority:priority,
      target_at:target_at,
    })
      .one(new HttpError(400, 'Savings with given ID not found'));

    return res.json(result);
  });
};
