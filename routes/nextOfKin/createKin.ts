import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { CreateNextOfKinInterface , NextOfKinInterface , CreateNextOfKinSchema  } from '../../types'; 
import { sql } from '../../db';
import { validateRequest } from '../../middleware/validationMiddleware';
 
const SQL_CREATE_KIN = sql< CreateNextOfKinInterface ,  NextOfKinInterface>(`
  INSERT INTO next_of_kins (user_id, full_name, relationship, email)
  SELECT COALESCE((SELECT MAX(id) FROM next_of_kin WHERE user_id = :user_id), 0) + 1,
  :full_name, :relationship, :email , :phone_number
  RETURNING *;
`);

export default (router: Router) => {
  router.post<Record<string, never>,NextOfKinInterface, CreateNextOfKinInterface,Record<string, never>,Record<string, never>>(
    '/', 
    authMiddleware(), 
    validateRequest(CreateNextOfKinSchema),
    async (req, res) => {
      const { full_name,relationship,email,phone_number } = req.body;
      const user_id = req.user!.id
      const nextOfKin = await SQL_CREATE_KIN({
        user_id,
        full_name,
        relationship,
        email,
        phone_number
      }).one()
      return res.json(nextOfKin);
    });
};
