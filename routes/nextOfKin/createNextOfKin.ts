import Router from '../../router';
import { z } from 'zod';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { nextOfKinSchema } from './schema';
import { UserRole } from '../../globalTypes';

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
    schema: {
      body: nextOfKinCreationSchema
    },
    response: {
      schema: nextOfKinPublicViewSchema
    },
    authMiddlewareOptions: { roles: [UserRole.USER] },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const nextOfKin = await SQL_CREATE_KIN({
        ...req.body,
        user_id: req.user!.id
      }).one(new HttpError(400));
      return res.json(nextOfKin);
    }
  });
};

export default createNextOfKin;