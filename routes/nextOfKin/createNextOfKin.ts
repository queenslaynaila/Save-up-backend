import { Router } from 'express';
import { z } from 'zod';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import validateRequest from '../../middleware/validationMiddleware';
import { baseNextOfKinSchema } from './schema';

const kinCreationSchema = baseNextOfKinSchema.pick({
  full_name: true,
  relationship: true,
  phone_number: true
});

type NextOfKinCreation = z.infer<typeof kinCreationSchema>;

const nextOfKinSchema = baseNextOfKinSchema.pick({
  xid: true,
  full_name: true,
  relationship: true,
  phone_number: true,
  created_at: true
});

export type NextOfKin = z.infer<typeof nextOfKinSchema>;

const SQL_CREATE_KIN = sql<NextOfKinCreation & { user_id: number }, NextOfKin>(`
  INSERT INTO next_of_kins (user_id, xid, full_name, relationship, phone_number)
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
  router.post<Record<string, never>, NextOfKin, NextOfKinCreation, Record<string, never>>(
    '/',
    validateRequest({
      body: kinCreationSchema
    }),
    authMiddleware(),
    async (req, res) => {
      const nextOfKin = await SQL_CREATE_KIN({
        ...req.body,
        user_id: req.user!.id
      }).one(new HttpError(400));
      return res.json(nextOfKin);
    }
  );
};