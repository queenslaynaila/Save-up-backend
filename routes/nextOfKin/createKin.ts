import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';
import { validateRequest } from '../../middleware/validationMiddleware';
import { CreateNextOfKinInterface , NextOfKinInterface , CreateNextOfKinSchema  } from '../../types'; 

const SQL_CREATE_KIN = sql<CreateNextOfKinInterface ,  NextOfKinInterface>(`
  INSERT INTO next_of_kins (id, user_id, full_name, relationship, email, phone_number)
  SELECT COALESCE((SELECT MAX(id) FROM next_of_kins WHERE user_id = :user_id), 0) + 1,
  :user_id, :full_name, :relationship, :email, :phone_number
  RETURNING id, full_name, relationship, email, phone_number;
`);

const NextOfKinCreationSchema = CreateNextOfKinSchema.omit({user_id: true});

export default (router: Router) => {
  router.post<Record<string, never>,NextOfKinInterface, CreateNextOfKinInterface,Record<string, never>,Record<string, never>>(
    '/', 
    authMiddleware(), 
    validateRequest(NextOfKinCreationSchema),
    async (req, res) => {
      const { full_name,relationship,email,phone_number } = req.body;
      const user_id = req.user!.id
      const nextOfKin = await SQL_CREATE_KIN({
        user_id,
        full_name,
        relationship,
        email,
        phone_number
      }).one(new HttpError(400, 'You already have an existing next of kin. Please update it'));
      return res.json(nextOfKin);
    });
};
