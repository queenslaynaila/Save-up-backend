import Router from '../../router';
import { z } from 'zod';
import { sql } from '../../db';
import HttpError from '../../httpError';
import { nextOfKinSchema } from './schema';
import { verifyPin } from '../../utils';

const nextOfKinCreationSchema = nextOfKinSchema.pick({
  full_name: true,
  relationship: true,
  phone_number: true
});
type NextOfKinCreationPayLoad = z.infer<typeof nextOfKinCreationSchema>
& { user_id: number };

export const nextOfKinPublicViewSchema = nextOfKinSchema.pick({
  xid: true,
  full_name: true,
  relationship: true,
  phone_number: true,
  created_at: true
});
export type NextOfKin = z.infer<typeof nextOfKinPublicViewSchema>;

const SQL_CREATE_KIN = sql<NextOfKinCreationPayLoad, NextOfKin>(`
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
  router.route({
    method: 'post',
    path: '/',
    summary: 'Create next of kin',
    request: {
      body: nextOfKinCreationSchema.extend({
        pin: z.string().regex(/^\d{4}$/)
      })
    },
    response: {
      200: {
        schema: nextOfKinPublicViewSchema
      }
    },
    authMiddlewareOptions: {},
    middlewares: [verifyPin],
    handler: async (req, res) => {
      const nextOfKin = await SQL_CREATE_KIN({
        ...req.body,
        user_id: req.user!.id
      }).oneOrNull().catch((err) => {
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