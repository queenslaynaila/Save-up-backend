import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { NextOfKinInterface } from '../../types';

const SQL_GET_KIN = sql<{user_id: number }, NextOfKinInterface>(`
    SELECT full_name,relationship,email,phone_number,created_at,updated_at FROM next_of_kins WHERE user_id = user_:id
`);

export default (router: Router) => {
  router.post<Record<string, never>,NextOfKinInterface,{ user_id: number },Record<string, never>,Record<string, never>>(
    '/records', 
    authMiddleware(), 
    async (req, res) => { 
      const user_id = req.user!.id
      const nextOfKin = await SQL_GET_KIN({user_id}).one()
      return res.json(nextOfKin);
    });
};
