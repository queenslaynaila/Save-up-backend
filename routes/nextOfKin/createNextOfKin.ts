import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { validateRequest } from '../../middleware/validationMiddleware';
import { NextOfKinCreationInterface, NextOfKinInterface, nextOfKinValidation } from './types'; 

const SQL_CREATE_KIN = sql<NextOfKinCreationInterface, NextOfKinInterface>(`
  INSERT INTO next_of_kins (
    user_id,
    xid,
    full_name,
    relationship,
    phone_number
  )
  SELECT 
    :user_id,
    COALESCE(MAX(xid) + 1, 1),
    :full_name,
    :relationship,
    :phone_number
  FROM next_of_kins
  WHERE user_id = :user_id
  RETURNING xid, full_name, relationship, phone_number, created_at;
`);

export default (router: Router) => {
  router.post<Record<string,never>, NextOfKinInterface, NextOfKinCreationInterface, 
  Record<string,never>>(
    '/', 
    authMiddleware(), 
    validateRequest(nextOfKinValidation),
    async (req, res) => {
      const nextOfKin = await SQL_CREATE_KIN({
        ...req.body, 
        user_id:req.user!.id
      }).one(new HttpError(400, 'You already have an existing next of kin.'));
      return res.json(nextOfKin);
    });
};
