import Router from '../../router';
import { z } from 'zod';
import { sql } from '../../db';
import HttpError from '../../httpError';
import { NextOfKin, nextOfKinSchema } from './schema';
import { verifyPin } from '../../utils';

const SQL_CREATE_KIN = sql<
Pick<NextOfKin,'user_id'|'full_name'|'relationship'|'phone_number' >,
Pick<NextOfKin, 'xid'|'full_name'|'relationship'|'phone_number'|'created_at'>
>(`
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

const createNextOfKin = (router: Router) => {
  router.post({
    path: '/users/me/next-of-kins',
    summary: 'Create next of kin',
    auth: true,
    schema: {
      body: nextOfKinSchema.pick({
        full_name: true,
        relationship: true,
        phone_number: true
      }).extend({
        pin: z.string().regex(/^\d{4}$/)
      })
    },
    response: {
        schema: nextOfKinSchema.pick({
          xid: true,
          full_name: true,
          relationship: true,
          phone_number: true,
          created_at: true
        })
    },
    middlewares: [verifyPin],
    handler: async (req, res) => {
      const nextOfKin = await SQL_CREATE_KIN({
        ...req.body,
        user_id: req.user!.id
      }).one().catch((err) => {
        if (err.code === '23505') {
          throw new HttpError(409);
        }
        throw err;
      });
      return res.status(201).json(nextOfKin);
    }
  });
};

export default createNextOfKin;