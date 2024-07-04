import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { NextOfKinInterface, NextOfKinInputInterface } from './types';

const SQL_GET_KIN = sql<NextOfKinInputInterface, NextOfKinInterface>(`
  SELECT xid, full_name, relationship, phone_number, created_at
  FROM next_of_kins 
  WHERE user_id = :user_id
  AND deleted_at is null
`);

export default (router: Router) => {
  router.get<Record<string,never>, NextOfKinInterface, NextOfKinInputInterface, 
  Record<string,never>>(
    '/', 
    authMiddleware(), 
    async (req, res) => { 
      const user_id = req.user!.id
      const nextOfKin = await SQL_GET_KIN({ user_id }).one()
      return res.json(nextOfKin);
    });
};
