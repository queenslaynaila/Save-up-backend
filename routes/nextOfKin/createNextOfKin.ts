import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { validateRequest } from '../../middleware/validationMiddleware';
import { CreateNextOfKinInterface, NextOfKinInterface, nextOfKinCreationSchema } from './types'; 

const SQL_CREATE_KIN = sql<CreateNextOfKinInterface, NextOfKinInterface>(`
  INSERT INTO next_of_kins (id, user_id, full_name, relationship, email, phone_number)
  VALUES (
    SELECT COALESCE((SELECT MAX(id) FROM next_of_kins WHERE user_id = :userId), 0) + 1,
    :userId, :fullName, :relationship, :email, :phoneNumber )
  RETURNING id, full_name, relationship, email, phone_number;
`);

export default (router: Router) => {
  router.post<Record<string,never>, NextOfKinInterface, CreateNextOfKinInterface, Record<string,never>, Record<string,never>>(
    '/', 
    authMiddleware(), 
    validateRequest(nextOfKinCreationSchema),
    async (req, res) => {
      const { fullName,relationship,email,phoneNumber } = req.body;
      const userId = req.user!.id
      const nextOfKin = await SQL_CREATE_KIN({
        userId,
        fullName,
        relationship,
        email,
        phoneNumber
      }).one(new HttpError(400, 'You already have an existing next of kin. Please update it'));
      return res.json(nextOfKin);
    });
};
